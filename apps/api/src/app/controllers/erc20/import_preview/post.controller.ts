import { Request, Response } from 'express';
import { body } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';

export const validation = [body('address').exists().isString(), body('chainId').exists().isInt()];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20 Contract']
    #swagger.responses[200] = { 
            description: 'returns symbol, name and totalSupply of an onchain erc20 token'
    }
    */
    const result = await ERC20Service.getOnChainERC20Token(req.body.chainId, req.body.address);

    res.status(200).json(result);
};
export default { controller, validation };
