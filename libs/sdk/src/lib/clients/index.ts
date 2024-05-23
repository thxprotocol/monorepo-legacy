import THXBrowserClient from './Browser';
import THXAPIClient from './API';
import THXIdentityClient from './Identity';
import THXWidget from './Widget';
export type THXClient = THXIdentityClient | THXBrowserClient | THXAPIClient;
export { THXBrowserClient, THXIdentityClient, THXAPIClient, THXWidget };
