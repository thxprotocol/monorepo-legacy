import queue from 'queue';

export const COMMAND_QUEUE = queue({ concurrency: 1, timeout: 3000, autostart: true })