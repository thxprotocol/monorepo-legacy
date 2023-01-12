import path from 'path';

const required = [
    'API_URL',
    'AUTH_URL',
    'WALLET_URL',
    'PUBLIC_URL',
    'DASHBOARD_URL',
    'MONGODB_URI',
    'PORT',
    'SECURE_KEY',
];

// For production (docker containers) we should require JWKS_JSON to be set since otherwise each container
// would generate their own jwks.json.
if (process.env.NODE_ENV === 'production') {
    required.push('SENDGRID_API_KEY', 'JWKS_JSON');
}

required.forEach((value: string) => {
    if (!process.env[value]) {
        console.log(`Set ${value} environment variable.`);
        process.exit(1);
    }
});

// This allows you to use a single .env file with both regular and test configuration. This allows for an
// easy to use setup locally without having hardcoded credentials during test runs.
if (process.env.NODE_ENV === 'test') {
    if (process.env.AUTH_URL_TEST_OVERRIDE !== undefined) process.env.AUTH_URL = process.env.AUTH_URL_TEST_OVERRIDE;
    if (process.env.PORT_TEST_OVERRIDE !== undefined) process.env.AUTH_PORT = process.env.PORT_TEST_OVERRIDE;
    if (process.env.MONGODB_URI_TEST_OVERRIDE !== undefined)
        process.env.MONGODB_URI = process.env.MONGODB_URI_TEST_OVERRIDE;
}

export const VERSION = 'v1';
export const GITHUB_API_ENDPOINT = 'https://api.github.com';
export const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2';
export const GOOGLE_API_ENDPOINT = 'https://www.googleapis.com';
export const SPOTIFY_API_ENDPOINT = 'https://api.spotify.com/v1';
export const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';
export const TWITCH_API_ENDPOINT = 'https://api.twitch.tv/helix';

export const CWD = process.env.CWD || path.resolve(__dirname, '../../../apps/auth/src');

export const NODE_ENV = process.env.NODE_ENV;
export const AUTH_URL = process.env.AUTH_URL;
export const API_URL = process.env.API_URL;
export const WALLET_URL = process.env.WALLET_URL;
export const PUBLIC_URL = process.env.PUBLIC_URL;
export const DASHBOARD_URL = process.env.DASHBOARD_URL;
export const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
export const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
export const WIDGET_URL = process.env.WIDGET_URL;
export const MONGODB_URI = String(process.env.MONGODB_URI);
export const PORT = process.env.PORT;
export const SECURE_KEY = process.env.SECURE_KEY;
export const GTM = process.env.GTM;
export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const INITIAL_ACCESS_TOKEN = process.env.INITIAL_ACCESS_TOKEN;
export const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID;
export const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
export const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
export const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
export const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
export const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET;
export const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID;
export const JWKS_JSON = process.env.JWKS_JSON;
export const LOCAL_CERT = process.env.LOCAL_CERT;
export const LOCAL_CERT_KEY = process.env.LOCAL_CERT_KEY;
