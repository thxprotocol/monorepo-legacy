import { Request, Response } from 'express';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

export default {
    controller: async (req: Request, res: Response) => {
        /*
        #swagger.tags = ['Client']
        #swagger.responses[200] = { 
            description: 'Get a list of client credentials for this user',
            schema: { 
                type: 'array',
                items: {
                    $ref: '#/definitions/Client' } 
                }
            }
        }
        */

        const clients = await ClientProxy.findByQuery(
            { poolId: req.header('X-PoolId') },
            Number(req.query.page),
            Number(req.query.limit),
        );
        res.status(200).json(clients);
    },
};
