import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { rpc, tgRpc } from '../api';

const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
  mockInvoke.mockReset();
  vi.restoreAllMocks();
});

describe('rpc', () => {
  it('calls rpc_call and returns result', async () => {
    mockInvoke.mockResolvedValueOnce(
      JSON.stringify({ jsonrpc: '2.0', id: 1, result: { books: [] } })
    );

    const result = await rpc<{ books: [] }>('book.list');
    expect(result).toEqual({ books: [] });
    expect(mockInvoke).toHaveBeenCalledWith(
      'rpc_call',
      expect.objectContaining({ body: expect.stringContaining('"method":"book.list"') })
    );
  });

  it('throws on JSON-RPC error', async () => {
    mockInvoke.mockResolvedValueOnce(
      JSON.stringify({ jsonrpc: '2.0', id: 1, error: { code: -32600, message: 'Bad request' } })
    );

    await expect(rpc('book.list')).rejects.toThrow('Bad request');
  });

  it('throws on invoke failure', async () => {
    mockInvoke.mockRejectedValueOnce(new Error('network error'));
    await expect(rpc('book.list')).rejects.toThrow('network error');
  });
});

describe('tgRpc', () => {
  it('posts to the Telegram channels JSON-RPC API and returns result', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const result = await tgRpc<[]>('channels.list');
    expect(result).toEqual([]);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/$/),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"method":"channels.list"'),
      })
    );
  });

  it('throws on Telegram channels JSON-RPC error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32601, message: 'Method not found' },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    await expect(tgRpc('channels.nope')).rejects.toThrow('Method not found');
  });
});
