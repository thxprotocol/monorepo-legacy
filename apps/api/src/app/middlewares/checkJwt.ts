import jwksRsa from 'jwks-rsa';
import expressJwtPermissions from 'express-jwt-permissions';
import { expressjwt } from 'express-jwt';
import { AUTH_URL, ISSUER } from '@thxnetwork/api/config/secrets';

export const checkJwt = expressjwt({
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${AUTH_URL}/jwks`,
    }),
    issuer: ISSUER,
    algorithms: ['RS256'],
});

export const guard = expressJwtPermissions({ requestProperty: 'auth', permissionsProperty: 'scope' });
