import { Request, Response } from 'express';
import { GrantVariant } from '@thxnetwork/common/enums';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import { widgetScopes } from '@thxnetwork/api/util/jest/constants';

export default {
    controller: async (req: Request, res: Response) => {
        const poolId = req.header('X-PoolId');
        const { grantType, redirectUri, requestUri, name } = req.body;
        const grantMap = {
            [GrantVariant.AuthorizationCode]: {
                application_type: 'web',
                grant_types: [grantType],
                request_uris: [requestUri],
                redirect_uris: [redirectUri],
                post_logout_redirect_uris: [requestUri],
                response_types: ['code'],
                scope: widgetScopes,
            },
            [GrantVariant.ClientCredentials]: {
                application_type: 'web',
                grant_types: [grantType],
                request_uris: [],
                redirect_uris: [],
                response_types: [],
                scope: 'openid events:write identities:read identities:write pools:write pools:read',
            },
        };
        const payload = grantMap[grantType];
        const client = await ClientProxy.create(req.auth.sub, poolId, payload, name);

        res.json(client);
    },
};
