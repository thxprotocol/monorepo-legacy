import { Request, Response } from 'express';
import { GrantType } from '@thxnetwork/types/enums/GrantType';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

export default {
    controller: async (req: Request, res: Response) => {
        /*
        #swagger.tags = ['Client']
        #swagger.responses[200] = { 
            description: 'Create a set of client credentials',
            schema: { $ref: '#/definitions/Client' } 
        }
        */

        const { grantType, redirectUri, requestUri, name } = req.body;
        let payload;
        switch (grantType) {
            case GrantType.AuthorizationCode:
                payload = {
                    application_type: 'web',
                    grant_types: [grantType],
                    request_uris: [requestUri],
                    redirect_uris: [redirectUri],
                    post_logout_redirect_uris: [requestUri],
                    response_types: ['code'],
                    scope: 'openid account:read erc20:read erc721:read point_rewards:read point_balances:read',
                };
                break;
            case GrantType.ClientCredentials:
                payload = {
                    application_type: 'web',
                    grant_types: [grantType],
                    request_uris: [],
                    redirect_uris: [],
                    response_types: [],
                    scope: 'openid wallets:write wallets:read',
                };
                break;
        }

        const client = await ClientProxy.create(req.auth.sub, req.headers['X-PoolId'] as string, payload, name);

        res.json(client);
    },
};
