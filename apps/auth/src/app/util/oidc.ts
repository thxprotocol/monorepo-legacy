import { Provider } from 'oidc-provider';
import { AUTH_URL, NODE_ENV } from '../config/secrets';
import { AccountService } from '../services/AccountService';
import { BadRequestError, NotFoundError } from './errors';
import PoolProxy from '../proxies/PoolProxy';
import configuration from '../config/oidc';
import jwt from 'jsonwebtoken';

const oidc = new Provider(AUTH_URL, configuration);

oidc.proxy = true;

if (NODE_ENV !== 'production') {
    const { invalidate: orig } = (oidc.Client as any).Schema.prototype;
    (oidc.Client as any).Schema.prototype.invalidate = function invalidate(message, code) {
        if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') return;
        orig.call(this, message);
    };
}

oidc.registerGrantType(
    'identity_code',
    async (ctx: any, next) => {
        const clientId = ctx.oidc.params.client_id;
        if (!clientId) throw new BadRequestError('client_id is required');

        const code = ctx.oidc.params.identity_code;
        if (!code) throw new BadRequestError('identity_code is required');
        console.log(clientId, code);

        const identity = await PoolProxy.findIdentity({ code, clientId });
        if (!identity) throw new BadRequestError('Identity not found');
        if (!identity.sub) {
            // TODO Create a new account if none exists and update the identity with the account id
            // future token requests will then use the correct account ID.
            throw new BadRequestError('Identity not connected to account');
        }

        const account = await AccountService.get(identity.sub);
        if (!account) throw new NotFoundError('Account not found for this identity_code');

        const client = await oidc.Client.find(clientId);
        const at = new oidc.AccessToken({
            aud: clientId,
            gty: 'identity_code',
            accountId: account.id,
            grantId: 'identity_code',
            client,
            scope: ctx.oidc.params.scope as string,
        });

        const ONE_DAY = 1000 * 60 * 60 * 24; // 24 hours
        try {
            const accessToken = await jwt.sign(
                {
                    sub: account.id,
                    jti: clientId,
                    iat: Date.now(),
                    exp: Date.now() + ONE_DAY,
                    scope: ctx.oidc.params.scope,
                    client_id: clientId,
                    iss: AUTH_URL,
                    aud: clientId,
                },
                configuration.jwks[0].kid,
                { expiresIn: '24h' },
            );

            ctx.body = {
                access_token: accessToken,
                expires_in: ONE_DAY,
                token_type: 'Bearer',
            };

            await next();
        } catch (error) {
            console.log(error);
        }
    },
    ['identity_code'],
);

export { oidc };
