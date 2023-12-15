import THXBrowserClient from './Browser';
import THXAPIClient from './API';
export type THXClient = THXBrowserClient | THXAPIClient;
export { THXBrowserClient, THXAPIClient };
export * from './Widget';
