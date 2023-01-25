import { logger } from '../utils/logger';

const required = ['TOKEN', 'DISCORD_CLIENT_ID', 'OIDC_CLIENT_ID', 'OIDC_CLIENT_SECRET', 'AUTH_URL'];

required.forEach((value: string) => {
    if (!process.env[value]) {
        logger.error(`Set ${value} environment variable.`);
        process.exit(1);
    }
});

export const TOKEN = process.env['TOKEN'];
export const DISCORD_CLIENT_ID = process.env['DISCORD_CLIENT_ID'];
export const OIDC_CLIENT_ID = process.env['OIDC_CLIENT_ID'];
export const OIDC_CLIENT_SECRET = process.env['OIDC_CLIENT_SECRET'];
export const AUTH_URL = process.env['AUTH_URL'];
export const PKG_ENV = process.env['PKG_ENV'] || 'local';
export const MONGODB_URI = process.env['MONGODB_URI'] || '';
