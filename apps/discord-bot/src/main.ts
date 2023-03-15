import fetch, { Headers } from 'node-fetch';
import bootstrap from './bootstrap';
import './healthcheck';

if (!globalThis.fetch) {
    globalThis.fetch = fetch as any;
    globalThis.Headers = Headers as any;
}

bootstrap();
