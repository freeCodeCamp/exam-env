# Contributing Guide

## Development

### Prerequisites

https://v2.tauri.app/start/prerequisites/

https://v2.tauri.app/reference/cli/

> [!NOTE]
> This repo uses `bun`. It is recommended to use `cargo` for the tauri cli commands, but bun may also be used.

### Start

```bash
cp sample.env .env
bun i
# If the install did not automatically run this:
bun run prisma generate
```

```bash
cargo tauri dev --config backend/tauri.dev.conf.json
```

## Pull Request

Ensure your commit messages and PR titles follow the following convention:

```
<type>(<scope>)?: <description>
```

Where:

- **type**: The type of change - `feat`, `fix`, `perf`, `refactor`, `revert`, `chore`, `dev`, `build`, `ci`, `docs`, `test`, `style`
- **scope**: Optional scope of the change (e.g. `client`, `backend`, `prisma`, `.github`)
- **description**: A brief description of the change

Breaking changes are marked with a `!` before the colon, or a `BREAKING CHANGE:` footer:

```
feat(backend)!: drop support for legacy exam tokens
```

`pr-title.yml` validates PR titles against this convention, because the title becomes the squashed commit subject that release-please reads. See [Deployment Workflow](#deployment-workflow) for how the type maps to a version bump.

## Build

### Updater

Requires updater signing keys for the update artifacts:

```bash
export TAURI_SIGNING_PRIVATE_KEY="Path or content of your private key"
# optionally also add a password
export TAURI_SIGNING_PRIVATE_KEY_PASSWORD=""
```

Creating the key is a **ONE TIME** operation:

```bash
cargo tauri signer generate -w ./.tauri/exam-env.key
```

### Local

```bash
cargo tauri build --config backend/tauri.dev.conf.json
# OR, build a debug build
cargo tauri build --debug
```

The `tauri.conf.dev.json` config does not sign the bundle, and does not create updater artifacts. Also, it disables the `contentProtected` feature so the app can be screenshotted.

### Windows

```bash
.\scripts\WindowsEnv.ps1 -Command "cargo tauri build --config backend/tauri.microsoftstore.conf.json --bundles msi,updater --target x86_64-pc-windows-msvc"
```

## Deployment Workflow

Versioning and changelogs are handled by [release-please](https://github.com/googleapis/release-please). The version is derived from the conventional commit subjects on `main`.

Configuration lives in `release-please-config.json`, and the current released version in `.release-please-manifest.json`. A release bumps `package.json`, `backend/Cargo.toml` and `Cargo.lock` together, and appends to `CHANGELOG.md`.

### 1. Release Please (`release-please.yml`)

Runs on every push to `main`:

1. Maintains an open release PR titled `chore(main): release X.Y.Z`, rewritten on each push. It is a live preview of the next version and its changelog.
2. When that PR is merged, it tags `production/X.Y.Z`, creates a draft GitHub release, and continues in the same workflow run:
   - renames the release to `vX.Y.Z/production`
   - calls `build.yml` with `environment: production`
   - dispatches `upload-to-r2.yml`, which syncs artifacts and undrafts the release

> [!IMPORTANT]
> The `<environment>/<version>` tag and `v<version>/<environment>` release name are a cross-repo contract. The freeCodeCamp client selects a release with `name.endsWith('/production')` when deciding which build to offer for download, and `upload-to-r2.yml` derives the R2 destination prefix from the tag. See `client/src/templates/Challenges/exam-download/show.tsx`.
>
> release-please emits the tag natively via `component`/`tag-separator`, but names the release `production: vX.Y.Z`, so `release-please.yml` restores the expected name.

Merging the release PR **is** the production release. There is no separate trigger.

> [!NOTE]
> The chain runs inside one workflow because releases created with `GITHUB_TOKEN` do not fire `on: release` events.

### 2. Publish (`publish.yml`)

Manually triggered, for release candidates only:

1. Go to Actions → publish → Run workflow
2. Select:
   - **Environment**: `staging` or `development`
   - **Base version**: optional override; defaults to the version release-please would ship next
3. The workflow will:
   - Read the pending release PR's manifest, so the RC matches the version `main` would actually ship
   - Tag `<environment>/X.Y.Z-rc.N`, incrementing `N` past any existing RC for that version
   - Build a debug, unsigned bundle and upload it to the `<environment>` R2 prefix

RC versions are patched into `package.json` and `backend/Cargo.toml` in-flight by `build.yml`; they are never committed.

### 3. Build (`build.yml`)

Builds the Tauri bundles for every platform. Runs unsigned on `pull_request`, and signed when called with a `release_id`.

### Quick Release Process

**Production**

1. Review the open `chore(main): release X.Y.Z` PR
2. Merge it
3. Monitor `release-please` for completion

**Release candidate**

1. Run the `publish` workflow with `environment: staging`

### Choosing the version

The bump follows from the commits released since the last production tag:

| Commit                                                 | Bump  |
| ------------------------------------------------------ | ----- |
| `fix:`, `perf:`, `refactor:`                           | patch |
| `feat:`                                                | minor |
| `feat!:`, or any type with a `BREAKING CHANGE:` footer | major |
| `docs:`, `test:`, `style:`                             | none  |

To force a specific version, add a `Release-As: X.Y.Z` footer to a commit.

> [!IMPORTANT]
> PRs are squash-merged, so the **PR title** becomes the commit subject that release-please parses. `pr-title.yml` validates it. A title outside the convention produces no version bump and no changelog entry.
