import { Request, Response } from 'express';
import { query } from 'express-validator';
import ERC20Transfer from '@thxnetwork/api/models/ERC20Transfer';

export const validation = [query('erc20').exists().isString(), query('chainId').exists().isNumeric()];

export const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['ERC20Transaction']
    */
    const result = await ERC20Transfer.find({
        erc20: req.query.erc20,
        chainId: req.query.chainId,
        sub: req.auth.sub,
    });

    res.status(200).json(result);
};
export default { controller, validation };
