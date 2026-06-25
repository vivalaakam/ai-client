import { invoke } from '@tauri-apps/api/core';
import type {
  BookRecord,
  BookDetail,
  TranslationJob,
  SystemConfig,
  FeedItem,
  FeedPostType,
  FeedSourceMessage,
  AppConfigEntry,
  PromptRecord,
  TgChannel,
  TgMessage,
} from './types';
import { BASE_URL, TG_CHANNELS_URL } from './config';

let rpcId = 0;

export async function rpc<T = unknown>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const id = ++rpcId;
  const body = JSON.stringify({ jsonrpc: '2.0', method, params, id });
  console.log(`[rpc] → ${method}`);
  try {
    const text = await invoke<string>('rpc_call', { body });
    const data = JSON.parse(text) as {
      error?: { message: string; code: number; data?: unknown };
      result?: T;
    };
    if (data.error) {
      console.error(`[rpc] error ${method}:`, data.error);
      const err = new Error(data.error.message) as Error & { code: number; data?: unknown };
      err.code = data.error.code;
      err.data = data.error.data;
      throw err;
    }
    console.log(`[rpc] ← ${method} ok`);
    return data.result as T;
  } catch (e) {
    console.error(`[rpc] failed ${method}:`, e);
    throw e;
  }
}

export async function rpcWithFile<T = unknown>(
  method: string,
  params: Record<string, unknown>,
  file: File
): Promise<T> {
  const id = ++rpcId;
  const rpcJson = JSON.stringify({ jsonrpc: '2.0', method, params, id });
  const buffer = await file.arrayBuffer();
  const fileBytes = Array.from(new Uint8Array(buffer));
  console.log(`[rpc] → ${method} file=${file.name} size=${fileBytes.length}`);
  try {
    const text = await invoke<string>('rpc_with_file', {
      rpcJson,
      fileBytes,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
    });
    const data = JSON.parse(text) as { error?: { message: string; code: number }; result?: T };
    if (data.error) {
      console.error(`[rpc] error ${method}:`, data.error);
      const err = new Error(data.error.message) as Error & { code: number };
      err.code = data.error.code;
      throw err;
    }
    console.log(`[rpc] ← ${method} ok`);
    return data.result as T;
  } catch (e) {
    console.error(`[rpc] failed ${method}:`, e);
    throw e;
  }
}

export async function tgRpc<T = unknown>(
  method: string,
  params: Record<string, unknown> = {}
): Promise<T> {
  const id = ++rpcId;
  const body = JSON.stringify({ jsonrpc: '2.0', method, params, id });
  console.log(`[tg-rpc] → ${method}`);

  const res = await fetch(TG_CHANNELS_URL + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    throw new Error(`TG API HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    error?: { message: string; code: number; data?: unknown };
    result?: T;
  };
  if (data.error) {
    const err = new Error(data.error.message) as Error & { code: number; data?: unknown };
    err.code = data.error.code;
    err.data = data.error.data;
    throw err;
  }

  console.log(`[tg-rpc] ← ${method} ok`);
  return data.result as T;
}

export const api = {
  systemConfig: () => rpc<SystemConfig>('system.config'),
  modelList: () => rpc<{ models: string[] }>('model.list'),
  bookList: () => rpc<{ books: BookRecord[] }>('book.list'),
  bookGet: (bookId: string) => rpc<BookDetail>('book.get', { bookId }),
  bookDelete: (bookId: string) => rpc<{ deleted: boolean }>('book.delete', { bookId }),
  bookUpload: (file: File) =>
    rpcWithFile<{ jobId: string; status: string; uploadOnly: boolean }>('book.upload', {}, file),
  bookTranslate: (file: File, targetLang: string, sourceLang?: string, model?: string) =>
    rpcWithFile<{ jobId: string; status: string }>(
      'book.translate',
      { targetLang, sourceLang: sourceLang ?? '', model: model ?? '' },
      file
    ),
  bookStartTranslation: (bookId: string, targetLang: string, sourceLang?: string, model?: string) =>
    rpc<{ jobId: string; status: string }>('book.startTranslation', {
      bookId,
      targetLang,
      sourceLang: sourceLang ?? '',
      model: model ?? '',
    }),
  bookExport: (bookId: string, mode: 'original' | 'translated') =>
    rpc<{ outputPath: string; downloadUrl: string; mode: string }>('book.export', { bookId, mode }),
  jobList: () => rpc<{ jobs: TranslationJob[] }>('job.list'),
  jobGet: (jobId: string) => rpc<TranslationJob>('job.get', { jobId }),
  jobDelete: (jobId: string) => rpc<{ deleted: boolean }>('job.delete', { jobId }),
  taskList: (docId: string) => rpc<{ tasks: unknown[] }>('task.list', { docId }),
  tgChannelList: (limit = 100) => tgRpc<TgChannel[]>('channels.list', { limit }),
  tgChannelGet: (id: string) => tgRpc<TgChannel>('channels.get', { id }),
  tgMessages: (channelId: string, limit = 30, offset = 0) =>
    tgRpc<TgMessage[]>('channels.getMessages', { channelId, limit, offset }),
  feedList: (limit = 30, offset = 0, postType?: FeedPostType, isViewed?: boolean) =>
    tgRpc<FeedItem[]>('feed.list', {
      limit,
      offset,
      ...(postType ? { postType } : {}),
      ...(isViewed === undefined ? {} : { isViewed }),
    }),
  feedGet: (id: string) => tgRpc<FeedItem>('feed.get', { id }),
  feedMessages: (id: string) => tgRpc<FeedSourceMessage[]>('feed.getMessages', { id }),
  feedMarkViewed: (id: string) => tgRpc<{ ok: boolean }>('feed.markViewed', { id }),
  configList: () => tgRpc<AppConfigEntry[]>('config.list'),
  configGet: (slug: string) => tgRpc<AppConfigEntry>('config.get', { slug }),
  configSet: (slug: string, value: string) => tgRpc<AppConfigEntry>('config.set', { slug, value }),
  promptsList: (tags?: string[]) =>
    tgRpc<PromptRecord[]>('prompts.list', tags && tags.length > 0 ? { tags } : {}),
  promptsGet: (id: string) => tgRpc<PromptRecord>('prompts.get', { id }),
  promptsCreate: (content: string, tags: string[]) =>
    tgRpc<PromptRecord>('prompts.create', { content, tags }),
  promptsUpdate: (id: string, content: string, tags: string[]) =>
    tgRpc<PromptRecord>('prompts.update', { id, content, tags }),
  promptsHistory: (id: string) => tgRpc<PromptRecord[]>('prompts.history', { id }),
  promptsRender: (id: string, vars: Record<string, string>) =>
    tgRpc<{ rendered: string }>('prompts.render', { id, vars }),
};

// ponytail: BASE_URL still used in BookDetail for img/download URLs (browser loads those directly, not via invoke)
export { BASE_URL };
