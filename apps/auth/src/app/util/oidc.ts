import { Provider } from 'oidc-provider';
import { AUTH_URL, NODE_ENV } from '../config/secrets';
import { AccountService } from '../services/AccountService';
import { BadRequestError, NotFoundError } from './errors';
import PoolProxy from '../proxies/PoolProxy';
import configuration from '../config/oidc';
import instance from 'oidc-provider/lib/helpers/weak_cache';
import resolveResource from 'oidc-provider/lib/helpers/resolve_resource';

const oidc = new Provider(AUTH_URL, configuration);

oidc.proxy = true;

if (NODE_ENV !== 'production') {
    const { invalidate: orig } = (oidc.Client as any).Schema.prototype;
    (oidc.Client as any).Schema.prototype.invalidate = function invalidate(message, code) {
        if (code === 'implicit-force-https' || code === 'implicit-forbid-localhost') return;
        orig.call(this, message);
    };
}

const gty = 'identity_code';

oidc.registerGrantType(
    'identity_code',
    async (ctx: any, next) => {
        try {
            const clientId = ctx.oidc.params.client_id;
            if (!clientId) throw new BadRequestError('client_id is required');

            const code = ctx.oidc.params.identity_code;
            if (!code) throw new BadRequestError('identity_code is required');

            const identity = await PoolProxy.findIdentity({ code, clientId });
            if (!identity) throw new BadRequestError('Identity not found');
            if (!identity.sub) {
                // TODO Create a new account if none exists and update the identity with the account id
                // future token requests will then use the correct account ID.
                throw new BadRequestError('Identity not connected to account');
            }

            const account = await AccountService.get(identity.sub);
            if (!account) throw new NotFoundError('Account not found for this identity_code');

            const {
                ttl,
                features: { userinfo, resourceIndicators },
            } = instance(ctx.oidc.provider).configuration();
            const client = await oidc.Client.find(clientId);
            const resource = await resolveResource(ctx, code, { userinfo, resourceIndicators });
            const resourceServerInfo = await resourceIndicators.getResourceServerInfo(ctx, resource, ctx.oidc.client);
            const resourceServer = new ctx.oidc.provider.ResourceServer(resource, resourceServerInfo);
            const grant = new oidc.Grant({ clientId, accountId: account.id });

            const at = new oidc.AccessToken({
                client,
                resourceServer,
                gty,
                grantId: await grant.save(),
                accountId: account.id,
                scope: client.scope,
            });
            ctx.oidc.entity('AccessToken', at);

            const accessToken = await at.save();

            ctx.body = {
                access_token: accessToken,
                expires_in: ttl.AccessToken,
                token_type: 'Bearer',
            };

            await next();
        } catch (error) {
            console.error(error);
            ctx.body = {
                error: 'server_error',
                error_description: error.message || 'An error occurred',
            };
            ctx.status = error.status || 500;
            await next();
        }
    },
    ['identity_code', 'scope'],
);

export { oidc };
