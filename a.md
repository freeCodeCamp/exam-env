Sentry: actionable items for exam-env surfaced errors

Context

Sentry (org freecodecamp, project exam-env) has ~30 unresolved issues. Backend filter (backend/src/sentry_filter.rs) already drops updater/Linux-desktop noise and consolidates webview-creation
failures. Remaining problems fall into three buckets:

1.  Observability gaps - production builds ship no FE sourcemaps and no Rust debug symbols, so JS issues get minified titles ("fi", "Hr", "pi", culprit G3(...)) and native panics are all-<unknown>
    stacks. Several distinct API errors group into one mega-issue (EXAM-ENV-A0: 699 events / 520 users, marked resolved but still firing).
2.  Real bugs reachable from the code (keyring panic, non-Error captures, missing FE drop signature, devtools rejection, JWT leaked as Sentry user.id).
3.  Sentry housekeeping - stale issues from ≤1.8.x that no longer occur on 2.0.2.

Constraints confirmed: no Windows 7 support needed (WebView2 failure data shows only Win10 builds 14393-26200, no Win7); no webview-embedded bundles (keep default downloadBootstrapper; Store variant
already offlineInstaller); no debug builds released - symbolication must come from symbol/sourcemap upload workarounds.

Per user decisions: API 5xx errors stay as-is (valid signal); replace JWT user.id with inner token id; devtools rejection suppressed via filter only.

---

A. Symbolication (highest leverage - unblocks triage of everything else)

A1. Upload FE sourcemaps in CI

@sentry/vite-plugin is already wired (vite.config.ts:27-31, org/project set, build.sourcemap: true) but SENTRY_AUTH_TOKEN is never provided in CI, so no sourcemaps/releases are uploaded.

- Create a Sentry org auth token (scopes: project:releases, org:read) and add SENTRY_AUTH_TOKEN repo secret.
- .github/workflows/build.yml: pass SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }} into the tauri-apps/tauri-action@dev step env (~line 244). Gate to publish builds (inputs.release_id != '') like
  the signing secrets block, so PR builds from forks never see it.
- Verify vite plugin config deletes sourcemaps after upload (sourcemaps.filesToDeleteAfterUpload) so .map files are not shipped inside the bundle (exam integrity).
- Fixes: unreadable titles/stacks on EXAM-ENV-A6, 7R, 9W, A0, 92, and the fragmented minified-name issues ("fi", "Hr", "pi", "a2", "sce"). Better stacks should also naturally split the A0 mega-group.

A2. Rust debug info + debug-files upload (workaround for no debug builds)

No [profile.release] exists (root Cargo.toml); release binaries have zero debug info, and nothing uploads native symbols → panics like EXAM-ENV-42/2F are all-<unknown>.

- Root Cargo.toml:
  [profile.release]
  debug = "line-tables-only" # file/line frames, minimal size cost
  split-debuginfo = "packed" # .pdb (MSVC default anyway) / .dSYM (macOS)
- Linux keeps line tables in the ELF (small); evaluate AppImage size delta during implementation - if unacceptable, Linux-only objcopy+strip step.
- New CI step in build.yml after the tauri-action step, publish builds only:
  sentry-cli debug-files upload --org freecodecamp --project exam-env ./backend/target/<target>/release/ (bundled sources optional via --include-sources).
- Result: future native panic events (2F and successors) get file/line frames; attach_stacktrace (A3) becomes useful.

A3. Backend ClientOptions tuning (backend/src/main.rs:28-38)

- attach_stacktrace: true - captured Errors (Credential/FS/Request) currently have no stacktrace at all (e.g. EXAM-ENV-4Q "No stacktrace available"); with A2 symbols these become locatable.
- auto_session_tracking: true + session_mode: SessionMode::Application - release-health/crash-free-rate per release, cheap win given event volume is low.
- Note: panic integration is already active via sentry default features (confirmed by mechanism: panic events) - no change needed there, despite it looking unconfigured.

B. Code fixes for specific issues

B1. EXAM-ENV-97 - keyring panic secret::get_entry (backend/src/secret.rs:52-55)

Entry::new(...).expect(...) panics at runtime (5 fatal events, Linux, NoEntry). Change get*entry() -> Result<Entry, Error> (ErrorKind::Credential) and propagate in
get*/set\_/remove_authorization_token. get_authorization_token already returns Option - map Err→None there.

B2. EXAM-ENV-A6 (41 users) - missing auth header on login treated as error

verifyToken (frontend/utils/fetch.ts:59-65) captures non-404/418 errors; an empty/whitespace token yields API 400 FCC*EINVAL_EXAM_ENVIRONMENT_AUTHORIZATION_TOKEN which is a client-input condition, not
a bug. Extend the no-capture guard to 400 (or to the specific FCC_EINVAL*...\_AUTHORIZATION_TOKEN code), and validate non-empty token in the login form before calling.

B3. "Object captured as exception" / "Error: No error message" normalization

- frontend/utils/fetch.ts:245: captureException(res.error) passes a raw object → "Object captured as exception with keys: code, message" titled by minified frame. Route through the existing
  captureError(res) helper (fetch.ts:366-376).
- throw new Error(res.error.message) sites: when message is undefined Sentry titles it "No error message" (part of A0). Fall back to res.error.code ?? res.response.statusText.

B4. Sentry user.id: replace raw JWT with inner token id

Both backend/src/error.rs:144-154 and FE frontend/contexts/auth.tsx set user.id to the full authorization JWT (a live bearer token, visible in every event). Decode the JWT payload (base64, no
signature verification needed - it is our own token used only as an identifier) and use examEnvironmentAuthorizationToken (hex id matching the DB record) as user.id on both sides. Support keeps DB
correlation; token no longer leaks.

B5. FE drop-signature gaps (frontend/main.tsx:33-37)

- Add "failed to check for updates" - EXAM-ENV-7Z ("Error: Request: failed to check for updates: Reqwest(...") is the FE-side capture of the update-check noise the backend filter already drops (11
  events/14d).
- Add "internal_toggle_devtools not allowed" - suppresses EXAM-ENV-Z (devtools stays capability-blocked; per user decision, filter-only fix).

B6. Backend filter addition (backend/src/sentry_filter.rs)

EXAM-ENV-AN (WebView2 error: WindowsError(... 0x8007139F ...), 57 events) escapes the webview-unavailable consolidation because its message lacks the "failed to create webview" prefix. Add "WebView2
error: WindowsError" to WEBVIEW_UNAVAILABLE_SIGNATURES.

B7. EXAM-ENV-AK - WebView2 creation failure remediation (best effort)

80+ events, ongoing on 2.0.2, consolidated fingerprint working. 0x80070057/quota errors are commonly caused by a broken WebView2 runtime or an unwritable/redirected %LOCALAPPDATA% EBWebView data
folder. Within no-embed constraint:

- On webview-creation failure, show a native Win32 message box (no webview needed) telling the user to repair/reinstall the WebView2 runtime, with the official installer URL.
- Optional second step (evaluate during implementation): retry once with a fallback --user-data-folder under %TEMP% before giving up.

B8. EXAM-ENV-30 (38 users, macOS) - "Read-only file system (os error 30)"

App run from mounted DMG / app-translocation → writes to app-relative paths fail; title shows <unknown> because only a string reaches Sentry. At startup on macOS, detect read-only/translocated install
(exe path under /Volumes/ or read-only mount) and surface "move the app to /Applications" guidance instead of a raw error. Also identify the failing write path (likely updater install) during
implementation.

B9. EXAM-ENV-9W - listeners[eventId].handlerId unlisten race

Known @tauri-apps/api event bug (double-unlisten / unlisten after drop), 14 users on 2.0.2. Update @tauri-apps/api + plugins to latest 2.x (fix landed upstream); audit FE listen/unlisten cleanup in
root.tsx/splashscreen.tsx for double-invocation guards.

C. Sentry housekeeping (via MCP update_issue after fixes merge)

- EXAM-ENV-42 (tao re-entrant panic): only releases ≤1.7.5, none in 14d → resolve.
- EXAM-ENV-4Q / 4T (keyring storage failures): last seen 1.8.x/May → resolve; B1 covers the panic variant.
- EXAM-ENV-A0: currently "resolved" yet firing - unresolve, then re-resolve per-code issues as B3 splits it.
- Minified-title issues ("fi", "Hr", "pi", "a2", "sce", <unknown> FE ones): resolve after A1 ships; new events regroup under readable titles.
- EXAM-ENV-2F (tao subclass_result.as_bool() assertion, still on 2.0.2): keep open; after A2, symbolicated frames determine whether it is upstream tao (then report/bump tao) - no local fix available
  now.
- Explicitly no action (confirmed non-actionable / by user decision): API 5xx issues (7R/9T/9Z/AP) stay as-is; no Win7 work (no Win7 events exist); keep downloadBootstrapper install mode.

Order of work

1.  A1 + A2 + A3 (CI/config; needs SENTRY_AUTH_TOKEN secret created by maintainer)
2.  B1-B6 (small code fixes, one PR)
3.  B7-B9 (each needs a little investigation; separate PRs)
4.  C after the above ship in a release

Verification

- CI: run a staging publish build; confirm Sentry shows a new release with sourcemap artifacts and debug-files (Sentry → Settings → Debug Files / Source Maps).
- Throw a test FE error + trigger a test Rust capture_error in a staging build; confirm readable stack (file/line) in Sentry.
- B1: unit test get_entry error path; B2: submit empty token in login → no Sentry event, form validation shown.
- Filters: unit tests exist for sentry_filter.rs patterns - extend for the new signature; FE beforeSend covered by adding the two signatures to existing drop-list tests if present, else manual verify
  via Sentry.captureException in dev.
- Post-release: monitor 14d event counts via Sentry MCP (search_events by issue) to confirm noise issues stop receiving events.
