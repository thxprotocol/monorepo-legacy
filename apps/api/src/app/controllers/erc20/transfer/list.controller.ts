import { Request, Response } from 'express';
import { query } from 'express-validator';
import { ERC20Transfer } from '@thxnetwork/api/models';

export const validation = [query('erc20Id').exists().isMongoId(), query('chainId').exists().isNumeric()];

export const controller = async (req: Request, res: Response) => {
    const result = await ERC20Transfer.find({
        erc20Id: req.query.erc20Id,
        chainId: req.query.chainId,
        sub: req.auth.sub,
    });

    res.status(200).json(result);
};
export default { controller, validation };
