import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import { Request, Response } from 'express';
import { query } from 'express-validator';

export const validation = [query('archived').optional().isBoolean()];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Contract']
    #swagger.responses[200] = { 
        description: 'Get a list of ERC20 contracts for this user.',
        schema: { 
            type: 'array',
            items: { 
                $ref: '#/definitions/ERC20',
            } 
        }
    }
    */
    const archived = req.query.archived ? JSON.parse(String(req.query.archived)) : false;
    const erc20s = await ERC20Service.findBySub(req.auth.sub, archived);

    return res.send(erc20s.map(({ _id }) => _id));
};

export default { controller, validation };
