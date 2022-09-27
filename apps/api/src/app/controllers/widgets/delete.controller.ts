import { Request, Response } from 'express';
import { param } from 'express-validator';

import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import WidgetService from '@thxnetwork/api/services/WidgetService';
import { BadRequestError } from '@thxnetwork/api/util/errors';

const validation = [param('clientId').exists()];
const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Widgets']
    const client = await ClientProxy.get(req.params.clientId);

    if (!client) {
        throw new BadRequestError('Unable to find client');
    }

    await WidgetService.remove(req.params.clientId);
    await ClientProxy.remove(req.params.clientId);

    res.status(204).end();
};

export default { controller, validation };
