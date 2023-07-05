import { JWKS_JSON } from '../config/secrets';

export function getJwks() {
    if (JWKS_JSON) return JSON.parse(JWKS_JSON);
}
