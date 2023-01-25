import fetch, { Headers } from 'node-fetch';
import bootstrap from './bootstrap';
import dotenv from 'dotenv';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = `0`;


if (!globalThis.fetch) {
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
}

dotenv.config();
bootstrap();
