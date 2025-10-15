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

## Pull Request

Ensure your commit messages and PR titles follow the following convention:

```
<type>(<scope>)?: <description>
```

Where:

- **type**: The type of change - `feat`, `fix`, `chore`, `breaking`, `dev`
- **scope**: Optional scope of the change (e.g. `client`, `src-tauri`, `prisma`, `.github`)
- **description**: A brief description of the change

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
cargo tauri build --config src-tauri/tauri.dev.conf.json
# OR, build a debug build
cargo tauri build --debug
```

The `tauri.conf.dev.json` config does not sign the bundle, and does not create updater artifacts. Also, it disables the `contentProtected` feature so the app can be screenshotted.

### Windows

```bash
.\scripts\WindowsEnv.ps1 -Command "cargo tauri build --config src-tauri/tauri.microsoftstore.conf.json --bundles msi,updater --target x86_64-pc-windows-msvc"
```

## Deployment Workflow

The project uses an automated deployment workflow consisting of three GitHub Actions:

### 1. Version Bump (`version-bump.yml`)

Manually triggered workflow to create a version bump PR:

1. Go to Actions → version-bump → Run workflow
2. Select:
   - **Release Type**: `patch`, `minor`, or `major`
   - **Release Environment**: `development`, `staging`, or `production`
3. The workflow will:
   - Calculate the new version based on the release type
   - Update `package.json`, `src-tauri/Cargo.toml`, and `src-tauri/tauri.conf.json`
   - Create a PR with title: `Release vX.X.X (environment)`
   - Add labels: `release`, `automated`, and `environment: <selected>`

### 2. Auto Release (`auto-release.yml`)

Automatically triggered when a version bump PR is merged:

1. Verifies the PR was created by the github-actions bot
2. Extracts the environment from the PR label (e.g., `environment: production`)
3. Triggers the publish workflow with the correct environment
4. Defaults to `production` if no environment label is found

### 3. Publish (`publish.yml`)

Builds and publishes the application:

1. Triggered automatically by auto-release or manually via Actions
2. Builds the application for all platforms
3. Creates a GitHub release with the version from `package.json`
4. Uploads build artifacts and updater files

### Quick Release Process

1. Run the `version-bump` workflow with desired release type and environment
2. Review and merge the generated PR
3. The `auto-release` workflow automatically triggers `publish`
4. Monitor the publish workflow for completion

### Manual Release (Legacy)

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
