import { Request, Response } from 'express';
import { Client } from '@thxnetwork/api/models/Client';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

export default {
    controller: async (req: Request, res: Response) => {
        const poolId = req.header('X-PoolId');
        const clients = await Client.find({ poolId });
        const promises = clients.map(async (client) => {
            return await ClientProxy.getCredentials(client.toJSON());
        });
        const result = await Promise.all(promises);

        res.status(200).json(result);
    },
};
