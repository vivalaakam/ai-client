import { describe, it, expect } from 'vitest';
import { BASE_URL, TG_CHANNELS_URL, WS_URL } from '../config';

describe('config', () => {
  it('BASE_URL is a valid http URL', () => {
    expect(BASE_URL).toMatch(/^https?:\/\/.+/);
    expect(BASE_URL).not.toMatch(/\/$/); // no trailing slash
  });

  it('WS_URL is derived from BASE_URL', () => {
    expect(WS_URL).toMatch(/^wss?:\/\/.+\/ws$/);
    expect(WS_URL.replace(/^ws/, 'http')).toBe(BASE_URL + '/ws');
  });

  it('TG_CHANNELS_URL is a valid http URL without trailing slash', () => {
    expect(TG_CHANNELS_URL).toMatch(/^https?:\/\/.+/);
    expect(TG_CHANNELS_URL).not.toMatch(/\/$/);
  });
});
