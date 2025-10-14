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
cargo tauri dev --config src-tauri/tauri.dev.conf.json
```

### Miscellaneous

Mock data is located in `public/mocks/`.

- `public/mocks/exams.json`
  - For client on the landing page
- `public/mocks/generated-exam.json`
  - For client when starting an exam
- `public/mocks/latest.json`
  - For client splashpage when checking for new version

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

### Workflow

A manual run of the `publish` action can build and cut the release of the app. The `version` field in the `package.json` and `src-tauri/tauri.conf.json` files should be updated.

This is often best done in its own PR:

```bash
# Create patch, minor, major branch
git checkout -b release_<kind>
# Update version in package.json and src-tauri/tauri.conf.json
# Commit with message
git commit -m "release(<version>): <info>"
# Tag commit
git tag -a <version> -m "<info>"
# Push to remote
git push origin release_<kind>
# Merge PR, start GH Action
```

### Local

```bash
cargo tauri build --config src-tauri/tauri.dev.conf.json
# OR, build a debug build
cargo tauri build --debug
```

The `tauri.conf.dev.json` config does not sign the bundle, and does not create updater artifacts. Also, it disables the `contentProtected` feature so the app can be screenshotted.

### Windows

```bash
.\scripts\WindowsEnv.ps1 -Command "cargo tauri build --config src-tauri/tauri.microsoftstore.conf.json --bundles msi,updater --target x86_64-pc-windows-msvc"
```
