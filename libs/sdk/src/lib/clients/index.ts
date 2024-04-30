import THXBrowserClient from './Browser';
import THXAPIClient from './API';
import THXIdentityClient from './Identity';
import THXWidget from './Widget';
export type THXClient = THXBrowserClient | THXAPIClient | THXIdentityClient;
export { THXBrowserClient, THXIdentityClient, THXAPIClient, THXWidget };
