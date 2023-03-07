import { Request, Response } from 'express';
import { body } from 'express-validator';
import ERC1155Service from '@thxnetwork/api/services/ERC1155Service';

export const validation = [body('address').exists().isString(), body('chainId').exists().isInt()];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC1155 Contract']
    #swagger.responses[200] = { 
            description: 'returns the name of an onchain erc1155 token'
    }
    */
    const result = await ERC1155Service.getOnChainERC1155Token(req.body.chainId, req.body.address);

    res.status(200).json(result);
};
export default { controller, validation };
