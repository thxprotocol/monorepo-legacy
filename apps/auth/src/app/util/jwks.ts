import fs from 'fs';
import path from 'path';
import jose from 'jose';
import { JWKS_JSON } from '../util/secrets';
import { logger } from './logger';

export function getJwks() {
    if (JWKS_JSON) {
        return JSON.parse(JWKS_JSON);
    }

    const jwksPath = path.resolve(path.dirname(__dirname), 'jwks.json');

    if (!fs.existsSync(jwksPath)) {
        logger.warn('No JWKS_JSON env var set and no jwks.json present, generating a new one.');

        const keystore = new jose.JWKS.KeyStore();

        keystore.generateSync('RSA', 2048, { use: 'sig', alg: 'RS256' });

        fs.writeFileSync(jwksPath, JSON.stringify(keystore.toJWKS(true), null, 2));
    }

    return require(jwksPath);
}
