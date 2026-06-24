const raw = import.meta.env.VITE_AI_TRANSLATE_SERVER ?? 'http://mini-vivalaakam.local:3001';
export const BASE_URL = raw.replace(/\/$/, '');
export const WS_URL = BASE_URL.replace(/^http/, 'ws') + '/ws';

const tgRaw = import.meta.env.VITE_TG_CHANNELS_SERVER ?? 'http://localhost:3002';
export const TG_CHANNELS_URL = tgRaw.replace(/\/$/, '');
