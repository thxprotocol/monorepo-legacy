import { Request, Response } from 'express';
import { body } from 'express-validator';

import { WIDGET_URL } from '@thxnetwork/api/config/secrets';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import WidgetService from '@thxnetwork/api/services/WidgetService';
import { TClientPayload } from '@thxnetwork/api/models/Client';

const validation = [body('requestUris').exists(), body('postLogoutRedirectUris').exists(), body('metadata').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const payload: TClientPayload = {
        application_type: 'web',
        grant_types: ['authorization_code'],
        request_uris: req.body.requestUris,
        redirect_uris: [WIDGET_URL],
        post_logout_redirect_uris: req.body.postLogoutRedirectUris,
        response_types: ['code'],
        scope: 'openid rewards:read withdrawals:write',
    };
    const client = await ClientProxy.create(req.auth.sub, req.header('X-PoolId'), payload);

    const widget = await WidgetService.create(
        req.auth.sub,
        client._id,
        req.body.metadata.rewardUuid,
        req.body.metadata.poolId,
    );

    res.status(201).json(widget);
};

export default { controller, validation };
