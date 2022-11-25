import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { Claim } from '@thxnetwork/api/models/Claim';

const validation = [param('id').exists().isString()];

const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Claims']
    #swagger.responses[200] = { 
        description: 'List reward claims',
        schema: { $ref: '#/definitions/Claim' } 
    }
    */
    const claims = await Claim.find({ poolId: req.assetPool._id });
    res.json(claims);
};

export default { controller, validation };
