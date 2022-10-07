import { Request, Response } from 'express';
import { BadRequestError } from '@thxnetwork/api/util/errors';
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
        const poolId = req.header('X-PoolId');
        if (!poolId) throw new BadRequestError('X-PoolId header is not set');

        const clients = await ClientProxy.findByQuery({ poolId }, Number(req.query.page), Number(req.query.limit));
        res.status(200).json(clients);
    },
};
