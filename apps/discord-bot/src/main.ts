import fetch, { Headers } from 'node-fetch';
import bootstrap from './bootstrap';
import './healthcheck';
import './app/graphql/main';

if (!globalThis.fetch) {
    globalThis.fetch = fetch as any;
    globalThis.Headers = Headers as any;
}

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

bootstrap();
