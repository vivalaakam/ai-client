const raw = import.meta.env.VITE_AI_TRANSLATE_SERVER ?? 'http://mini-vivalaakam.local:3001';
export const BASE_URL = raw.replace(/\/$/, '');
export const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/ws';
