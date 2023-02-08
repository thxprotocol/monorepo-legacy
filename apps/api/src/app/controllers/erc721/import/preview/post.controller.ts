import { Request, Response } from 'express';
import { body } from 'express-validator';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';

export const validation = [body('address').exists().isString(), body('chainId').exists().isInt()];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC721 Contract']
    #swagger.responses[200] = { 
            description: 'returns symbol, name and totalSupply of an onchain erc721 token'
    }
    */
    const result = await ERC721Service.getOnChainERC721Token(req.body.chainId, req.body.address);

    res.status(200).json(result);
};
export default { controller, validation };
