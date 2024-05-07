import { Speed } from '@openzeppelin/defender-relay-client';
import path from 'path';

const required = [
    'AUTH_URL',
    'API_URL',
    'DASHBOARD_URL',
    'MONGODB_URI',
    'PORT',
    'AUTH_CLIENT_ID',
    'AUTH_CLIENT_SECRET',
    'INITIAL_ACCESS_TOKEN',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_PUBLIC_BUCKET_NAME',
    'AWS_S3_PUBLIC_BUCKET_REGION',
    'AWS_S3_PRIVATE_BUCKET_NAME',
    'AWS_S3_PRIVATE_BUCKET_REGION',
    'SAFE_TXS_SERVICE',
    'CWD',
];

if (process.env.NODE_ENV === 'production') {
    required.push(
        ...[
            'GCLOUD_RECAPTCHA_API_KEY',
            'POLYGON_RPC',
            'POLYGON_NAME',
            'POLYGON_RELAYER',
            'POLYGON_RELAYER_API_KEY',
            'POLYGON_RELAYER_API_SECRET',
            'INFURA_IPFS_PROJECT_ID',
            'INFURA_IPFS_PROJECT_SECRET',
            'RELAYER_SPEED',
            'TWITTER_API_TOKEN',
        ],
    );
} else if (process.env.NODE_ENV === 'development') {
    required.push(...['PRIVATE_KEY', 'HARDHAT_RPC', 'LOCAL_CERT', 'LOCAL_CERT_KEY', 'TWITTER_API_TOKEN']);
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
    if (process.env.MONGODB_URI_TEST_OVERRIDE !== undefined)
        process.env.MONGODB_URI = process.env.MONGODB_URI_TEST_OVERRIDE;
    if (process.env.HARDHAT_RPC_TEST_OVERRIDE) process.env.HARDHAT_RPC = process.env.HARDHAT_RPC_TEST_OVERRIDE;
}

export const VERSION = 'v1';
export const CWD = process.env.CWD || path.resolve(__dirname, '../../../apps/api/src');
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const AUTH_URL = process.env.AUTH_URL;
export const API_URL = process.env.API_URL;
export const WALLET_URL = process.env.WALLET_URL;
export const DASHBOARD_URL = process.env.DASHBOARD_URL;
export const WIDGET_URL = process.env.WIDGET_URL;
export const PUBLIC_URL = process.env.PUBLIC_URL;
export const HARDHAT_RPC = process.env.HARDHAT_RPC;
export const HARDHAT_NAME = process.env.HARDHAT_NAME;
export const POLYGON_RPC = process.env.POLYGON_RPC || 'https://rpc.ankr.com/polygon';
export const ETHEREUM_RPC = process.env.ETHEREUM_RPC || 'https://rpc.ankr.com/eth';
export const POLYGON_NAME = process.env.POLYGON_NAME;
export const MONGODB_URI = String(process.env.MONGODB_URI);
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const PORT = process.env.PORT;
export const AUTH_CLIENT_ID = process.env.AUTH_CLIENT_ID;
export const AUTH_CLIENT_SECRET = process.env.AUTH_CLIENT_SECRET;
export const RATE_LIMIT_REWARD_GIVE = Number(process.env.RATE_LIMIT_REWARD_GIVE);
export const RATE_LIMIT_REWARD_CLAIM = Number(process.env.RATE_LIMIT_REWARD_CLAIM);
export const RATE_LIMIT_REWARD_GIVE_WINDOW = Number(process.env.RATE_LIMIT_REWARD_GIVE_WINDOW);
export const RATE_LIMIT_REWARD_CLAIM_WINDOW = Number(process.env.RATE_LIMIT_REWARD_CLAIM_WINDOW);
export const INITIAL_ACCESS_TOKEN = process.env.INITIAL_ACCESS_TOKEN;
export const CIRCULATING_SUPPLY = process.env.CIRCULATING_SUPPLY;
export const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
export const INFURA_IPFS_PROJECT_ID = process.env.INFURA_IPFS_PROJECT_ID;
export const INFURA_IPFS_PROJECT_SECRET = process.env.INFURA_IPFS_PROJECT_SECRET;
export const MINIMUM_GAS_LIMIT = 54680;
export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
export const AWS_S3_PUBLIC_BUCKET_NAME = process.env.AWS_S3_PUBLIC_BUCKET_NAME;
export const AWS_S3_PUBLIC_BUCKET_REGION = process.env.AWS_S3_PUBLIC_BUCKET_REGION;
export const AWS_S3_PRIVATE_BUCKET_NAME = process.env.AWS_S3_PRIVATE_BUCKET_NAME;
export const AWS_S3_PRIVATE_BUCKET_REGION = process.env.AWS_S3_PRIVATE_BUCKET_REGION;
export const POLYGON_RELAYER = process.env.POLYGON_RELAYER;
export const POLYGON_RELAYER_API_KEY = process.env.POLYGON_RELAYER_API_KEY;
export const POLYGON_RELAYER_API_SECRET = process.env.POLYGON_RELAYER_API_SECRET;
export const LOCAL_CERT = process.env.LOCAL_CERT;
export const LOCAL_CERT_KEY = process.env.LOCAL_CERT_KEY;
export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
export const RELAYER_SPEED = (process.env.RELAYER_SPEED || 'fastest') as Speed;
export const MIXPANEL_TOKEN = process.env.MIXPANEL_TOKEN;
export const MIXPANEL_API_URL = 'https://api.mixpanel.com';
export const CYPRESS_EMAIL = process.env.CYPRESS_EMAIL || 'cypress@thx.network';
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
export const STRIPE_SECRET_WEBHOOK = process.env.STRIPE_SECRET_WEBHOOK || '';
export const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
export const TWITTER_API_TOKEN = process.env.TWITTER_API_TOKEN;
export const IPFS_BASE_URL = 'https://ipfs.io/ipfs/';
export const WEBHOOK_REFERRAL = process.env.WEBHOOK_REFERRAL;
export const WEBHOOK_MILESTONE = process.env.WEBHOOK_MILESTONE;
export const SAFE_TXS_SERVICE = process.env.SAFE_TXS_SERVICE || 'https://safe-transaction-polygon.safe.global';
export const BOT_TOKEN = process.env.BOT_TOKEN;
export const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
export const GITCOIN_API_KEY = process.env.GITCOIN_API_KEY;
export const BALANCER_POOL_ID = '0xb204bf10bc3a5435017d3db247f56da601dfe08a0002000000000000000000fe';
export const PINATA_API_JWT = process.env.PINATA_API_JWT || '';
export const ALLOWED_API_CLIENT_ID = process.env.ALLOWED_API_CLIENT_ID || '';
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GCLOUD_PROJECT_ID = process.env.GCLOUD_PROJECT_ID;
export const GCLOUD_RECAPTCHA_API_KEY = process.env.GCLOUD_RECAPTCHA_API_KEY;
export const GCLOUD_RECAPTCHA_SITE_KEY = process.env.GCLOUD_RECAPTCHA_SITE_KEY;
export const THX_CLIENT_ID = process.env.THX_CLIENT_ID;
export const THX_CLIENT_SECRET = process.env.THX_CLIENT_SECRET;
export const WEBHOOK_SIGNING_SECRET = process.env.WEBHOOK_SIGNING_SECRET;
