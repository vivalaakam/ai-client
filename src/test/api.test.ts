import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invoke } from '@tauri-apps/api/core';
import { rpc } from '../api';

const mockInvoke = vi.mocked(invoke);

beforeEach(() => {
  mockInvoke.mockReset();
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
