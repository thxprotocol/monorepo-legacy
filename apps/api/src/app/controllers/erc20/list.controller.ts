import ERC20 from '@thxnetwork/api/models/ERC20';
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
    let erc20s;
    if (req.query.archived == 'true') {
        erc20s = await ERC20Service.getAll(req.auth.sub);
    } else {
        erc20s = await ERC20.find({ sub: req.auth.sub, archived: false });
    }

    return res.send(erc20s.map(({ _id }) => _id));
};

export default { controller, validation };
