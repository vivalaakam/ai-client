# Architecture

`ai-client` is a Tauri desktop wrapper around a React app. The frontend owns UI state and navigation. The Rust side is intentionally thin: it proxies JSON-RPC and multipart file upload requests to the `ai-translate` backend so the desktop app does not call book RPC endpoints directly from browser code. Telegram channel feed data is read directly from the `ai-tg-channels` JSON-RPC API.

## Runtime Shape

```text
React UI
  -> src/api.ts
    -> Tauri invoke("rpc_call" | "rpc_with_file")
      -> src-tauri/src/lib.rs
        -> ai-translate HTTP JSON-RPC API

React UI
  -> WebSocket(WS_URL)
    -> ai-translate /ws

React UI
  -> fetch(TG_CHANNELS_URL)
    -> ai-tg-channels JSON-RPC API
```

`src/config.ts` derives:

- `BASE_URL` from `VITE_AI_TRANSLATE_SERVER`
- `WS_URL` by replacing the HTTP scheme with WS and appending `/ws`
- `TG_CHANNELS_URL` from `VITE_TG_CHANNELS_SERVER`

The Rust bridge independently reads `AI_TRANSLATE_SERVER`.

## Frontend Modules

- `App.tsx`: defines routes, tracks the currently uploading job, handles navigation, receives WebSocket job updates, and passes shared props into layout components.
- `MainContent.tsx`: renders the active route body: book grid, book detail, or jobs page.
- `Sidebar.tsx`: renders connection status, model count, navigation, refresh action, and book list progress.
- `DropZone.tsx`: validates supported file extensions, uploads files, and polls job/book state until the parsed book is available.
- `UploadOverlay.tsx`: shows upload/parsing progress while an upload job completes.
- `BookDetail.tsx`: shows book metadata, progress, chapters/images, translation controls, export actions, and delete action.
- `JobsView.tsx`: lists jobs, refreshes active jobs periodically, and exposes delete actions.
- `NewsFeed.tsx`: loads Telegram channels, lets the user switch channels, and renders paged message cards.
- `useBooks.ts`: loads books, system config, and model list.
- `useWebSocket.ts`: opens `/ws`, handles reconnect, and forwards `job_update` messages.

## Routes

- `/`: book library and upload area.
- `/book/:bookId`: book details and actions.
- `/news`: Telegram channel message feed.
- `/jobs`: translation job list.
- `*`: redirects to `/`.

## Backend Contract

The API facade in `src/api.ts` calls these JSON-RPC methods:

- `system.config`
- `model.list`
- `book.list`
- `book.get`
- `book.delete`
- `book.upload`
- `book.startTranslation`
- `book.export`
- `job.list`
- `job.get`
- `job.delete`
- `task.list`
- `book.translate`

The UI expects job statuses:

- `queued`
- `parsing`
- `translating`
- `assembling`
- `completed`
- `failed`

WebSocket messages are typed in `src/types.ts`. The currently handled event is `job_update`.

## Telegram Channels Contract

The Telegram parser backend lives in `/Users/vivalaakam/work/ai-tg-channels`. Its JSON-RPC server defaults to `http://localhost:3002/`.

The client calls:

- `channels.list` with optional `limit`
- `channels.get` with `id`
- `channels.getMessages` with `channelId`, optional `limit`, optional `offset`

The current feed UI renders only message text, date, pinned state, and channel metadata. Media fields exist in the backend schema but are not displayed yet.

## Tauri Bridge

`src-tauri/src/lib.rs` exposes two commands:

- `rpc_call(body: String)`: posts a JSON-RPC body to the backend and returns the response text.
- `rpc_with_file(body: String, file_name: String, file_bytes: Vec<u8>)`: sends multipart form data with RPC metadata and file bytes.

Both commands use `AI_TRANSLATE_SERVER`, defaulting to `http://mini-vivalaakam.local:3001`.

## Testing

Tests live under `src/test/`.

- `config.test.ts`: validates URL derivation/config behavior.
- `api.test.ts`: validates API helpers and RPC behavior.

Use `npm run ci` before merging changes. It runs TypeScript, ESLint, Prettier check, and Vitest.

## Notes For Changes

- Keep frontend DTOs in `src/types.ts` aligned with backend JSON-RPC responses.
- Add new backend methods through `src/api.ts`; avoid scattering raw method strings across components.
- When adding route-level behavior, update both `App.tsx` routing and this document.
- If file upload format changes, update `rpc_with_file`, `DropZone`, and backend docs together.
