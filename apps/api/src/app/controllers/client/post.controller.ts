import { Request, Response } from 'express';
import { GrantVariant } from '@thxnetwork/types/enums';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import { widgetScopes } from '@thxnetwork/api/util/jest/constants';

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
            case GrantVariant.AuthorizationCode:
                payload = {
                    application_type: 'web',
                    grant_types: [grantType],
                    request_uris: [requestUri],
                    redirect_uris: [redirectUri],
                    post_logout_redirect_uris: [requestUri],
                    response_types: ['code'],
                    scope: widgetScopes,
                };
                break;
            case GrantVariant.ClientCredentials:
                payload = {
                    application_type: 'web',
                    grant_types: [grantType],
                    request_uris: [],
                    redirect_uris: [],
                    response_types: [],
                    scope: 'openid',
                };
                break;
        }
        const poolId = req.header('X-PoolId');
        const client = await ClientProxy.create(req.auth.sub, poolId, payload, name);

        res.json(client);
    },
};
