import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';
import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { body, param } from 'express-validator';

export default {
    validation: [param('id').exists(), body('name').exists()],
    controller: async (req: Request, res: Response) => {
        let client = await ClientProxy.get(req.params.id);
        if (!client) throw new NotFoundError('Cannot found Client ID in this request');

        client = await ClientProxy.update(client.clientId, { name: req.body['name'] });
        res.status(200).json(client);
    },
};
