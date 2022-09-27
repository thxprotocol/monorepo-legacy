import { Request, Response } from 'express';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

export default {
    controller: async (req: Request, res: Response) => {
        /*
        #swagger.tags = ['Client']
        #swagger.responses[200] = {
            description: 'Get a set of client credentials',
            schema: { $ref: '#/definitions/Client' }
        }
        */
        const client = await ClientProxy.get(req.params.id);
        res.status(200).json(client);
    },
};
