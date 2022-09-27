import { Request, Response } from 'express';
import { param } from 'express-validator';

import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import WidgetService from '@thxnetwork/api/services/WidgetService';
import { BadRequestError, NotFoundError } from '@thxnetwork/api/util/errors';

const validation = [param('clientId').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const client = await ClientProxy.get(req.params.clientId);
    if (!client) {
        throw new BadRequestError('Could not find a client for this clientId.');
    }

    const widget = await WidgetService.get(req.params.clientId);
    if (!widget) {
        throw new NotFoundError();
    }

    res.json({
        requestUris: client.requestUris,
        clientId: client.clientId,
        clientSecret: client.clientSecret,
        registrationAccessToken: req.params.rat,
        metadata: {
            rewardId: widget.metadata.rewardId,
            poolId: widget.metadata.poolId,
        },
    });
};

export default { controller, validation };
