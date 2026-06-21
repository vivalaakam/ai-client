# AI Client

Desktop client for the `ai-translate` service and Telegram channel parser. The app lets a user upload books/articles, track parsing and translation jobs, browse book details, start translations, export results, delete books or jobs, and read a Telegram channels news feed.

## Stack

- React 18 + TypeScript
- Vite dev/build pipeline
- Tauri 2 desktop shell
- JSON-RPC backend API proxied through Tauri commands
- WebSocket job updates
- Vitest, ESLint, Prettier

## Requirements

- Node.js and npm
- Rust toolchain
- Tauri platform prerequisites for the target OS
- Running `ai-translate` server reachable from the desktop app

## Configuration

Copy `.env.example` to `.env` and set both variables to the same backend base URL unless you intentionally need different browser and Tauri targets:

```sh
VITE_AI_TRANSLATE_SERVER=http://mini-vivalaakam.local:3001
AI_TRANSLATE_SERVER=http://mini-vivalaakam.local:3001
VITE_TG_CHANNELS_SERVER=http://localhost:3002
```

- `VITE_AI_TRANSLATE_SERVER` is used by the React frontend for WebSocket URL construction and browser-visible links.
- `AI_TRANSLATE_SERVER` is used by the Rust Tauri backend when proxying JSON-RPC and file upload requests.
- `VITE_TG_CHANNELS_SERVER` is used by the React frontend for the Telegram channels JSON-RPC API.
- If unset, book translation defaults to `http://mini-vivalaakam.local:3001`; Telegram channels default to `http://localhost:3002`.

## Development

Install dependencies:

```sh
npm install
```

Run only the Vite frontend:

```sh
npm run dev
```

Run the desktop app through Tauri:

```sh
npm run tauri dev
```

The Vite server uses port `1420` with `strictPort: true`, matching `src-tauri/tauri.conf.json`.

## Build

Build the web assets:

```sh
npm run build
```

Build a desktop bundle:

```sh
npm run tauri build
```

Tauri runs `npm run build` before packaging and serves the built frontend from `dist`.

## Quality Gates

```sh
npm run check
npm run lint
npm run format:check
npm run test
npm run ci
```

`npm run ci` runs type checking, linting, formatting check, and tests.

## Main Workflows

- Home route `/`: lists uploaded books and shows upload drop zone.
- Book route `/book/:bookId`: displays metadata, chapters/images, translation controls, export links, and delete action.
- News route `/news`: shows parsed Telegram channel messages.
- Jobs route `/jobs`: lists active and completed translation jobs.
- Upload: `DropZone` sends book files to `book.upload`, then polls `job.get` until completion.
- Translation: `BookDetail` starts jobs through `book.startTranslation` and shows progress from book/job state.
- Export: `book.export` returns an artifact path opened through `${BASE_URL}/api/artifact/{path}`.

## Project Layout

- `src/main.tsx`: React entry point.
- `src/App.tsx`: router, top-level state, WebSocket job update wiring.
- `src/api.ts`: JSON-RPC helper and typed API facade.
- `src/config.ts`: backend HTTP and WebSocket URLs.
- `src/types.ts`: shared frontend DTO types.
- `src/hooks/useBooks.ts`: book/config/model loading hooks.
- `src/hooks/useWebSocket.ts`: reconnecting job update WebSocket.
- `src/components/`: application UI.
- `src/components/NewsFeed.tsx`: Telegram channel selector and message feed.
- `src-tauri/src/lib.rs`: Tauri commands that proxy backend requests.
- `src-tauri/tauri.conf.json`: window, build, and bundle configuration.

More implementation detail is in `docs/architecture.md`.
