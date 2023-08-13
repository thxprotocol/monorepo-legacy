import { Request, Response } from 'express';
import { GrantVariant } from '@thxnetwork/types/enums';
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
            case GrantVariant.AuthorizationCode:
                payload = {
                    application_type: 'web',
                    grant_types: [grantType],
                    request_uris: [requestUri],
                    redirect_uris: [redirectUri],
                    post_logout_redirect_uris: [requestUri],
                    response_types: ['code'],
                    scope: 'openid offline_access',
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

        const client = await ClientProxy.create(req.auth.sub, req.headers['X-PoolId'] as string, payload, name);

        res.json(client);
    },
};
