import fetch, { Headers } from 'node-fetch';
import bootstrap from './bootstrap';
import dotenv from 'dotenv';

if (!globalThis.fetch) {
    globalThis.fetch = fetch as any;
    globalThis.Headers = Headers as any;
}

dotenv.config();

bootstrap();
