# AI Client — Agent Guide

Tauri v2 desktop client for the ai-translate service.

## Environment

Copy `.env.example` → `.env` and set:

| Variable | Purpose |
|---|---|
| `VITE_AI_TRANSLATE_SERVER` | Backend URL used by the frontend (Vite build-time) |
| `AI_TRANSLATE_SERVER` | Backend URL used by the Rust HTTP proxy commands (runtime) |

Both must point to the same server. Default: `http://mini-vivalaakam.local:3001`.

## Stack

- **Frontend**: React 18 + TypeScript + Vite (port 1420 in dev)
- **Desktop shell**: Tauri v2 (Rust)
- **HTTP to backend**: Rust `reqwest` via Tauri commands (`rpc_call`, `rpc_with_file`) — bypasses browser CORS
- **WebSocket**: native browser WS (no CORS restriction)

## Task workflow — required after every change

Run all checks before committing. A commit must not be made if any check fails.

```bash
# Frontend
npm run ci          # tsc + eslint + prettier:check + vitest

# Rust
cargo fmt --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

Shorthand for the full suite:
```bash
npm run ci && cargo fmt --manifest-path src-tauri/Cargo.toml && cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings && cargo test --manifest-path src-tauri/Cargo.toml
```

When adding new logic, add a corresponding test in `src/test/` (frontend) or `src-tauri/src/` (Rust). Trivial one-liners don't need tests.

## Project structure

```
src/
  config.ts          # BASE_URL / WS_URL from env vars
  api.ts             # JSON-RPC via Tauri invoke (no CORS)
  hooks/             # useBooks, useConfig, useModels, useWebSocket
  components/        # React UI components
  test/              # Vitest tests (setup.ts mocks Tauri invoke)
src-tauri/
  src/lib.rs         # rpc_call + rpc_with_file commands, reads AI_TRANSLATE_SERVER
  capabilities/      # Tauri permission grants
```

## Dev

```bash
cargo tauri dev
```

Rust logs stream to terminal (level: debug). JS logs visible in DevTools (right-click → Inspect).
