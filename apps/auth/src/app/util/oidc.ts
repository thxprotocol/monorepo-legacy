import { Provider } from 'oidc-provider';
import configuration from '../config/oidc';
import { AUTH_URL, NODE_ENV } from '../config/secrets';
import { AccountService } from '../services/AccountService';
import { BadRequestError, NotFoundError } from './errors';
import PoolProxy from '../proxies/PoolProxy';

const oidc = new Provider(AUTH_URL, configuration);

oidc.proxy = true;

if (NODE_ENV !== 'production') {
    const { invalidate: orig } = (oidc.Client as any).Schema.prototype;
    (oidc.Client as any).Schema.prototype.invalidate = function invalidate(message, code) {
        if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') return;
        orig.call(this, message);
    };
}

oidc.registerGrantType('identity_code', async (ctx, next) => {
    console.log('handling grant!');
    console.log(ctx);

    // X-Identity-Code header is required for this grant type
    const code = ctx.request.header['x-identity-code'];
    console.log(code);
    if (!code) throw new BadRequestError('X-Identity-Code header is required');

    // Get client_id here as it will tell us which pool to load
    const clientId = ctx.oidc.client.clientId;
    if (!clientId) throw new BadRequestError('Client ID is required');

    const identity = await PoolProxy.findIdentity({ code, clientId });
    if (!identity) throw new BadRequestError('Identity not found');
    if (!identity.sub) throw new BadRequestError('Identity not connected to account');

    const account = await AccountService.get(identity.sub);
    if (!account) throw new NotFoundError('Account not found for this identity_code');

    const AccessToken = oidc.AccessToken;
    const at = new AccessToken({
        gty: 'identity_code',
        accountId: account.id,
        client: ctx.oidc.client,
        grantId: 'identity_code',
        scope: ctx.oidc.params.scope as string,
    });

    const accessToken = await at.save();

    ctx.body = {
        access_token: accessToken,
        expires_in: at.expiration,
        token_type: 'Bearer',
    };

    await next();
});

export { oidc };
