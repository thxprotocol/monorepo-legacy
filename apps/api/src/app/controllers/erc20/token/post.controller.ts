import { Request, Response } from 'express';
import { body } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';

export const validation = [
    body('address').exists().isString(),
    body('chainId').exists().isInt(),
    body('logoImgUrl').optional().isString(),
];

export const controller = async (req: Request, res: Response) => {
    const erc20 = await ERC20Service.importToken(
        Number(req.body.chainId),
        req.body.address,
        req.auth.sub,
        req.body.logoImgUrl,
    );

    res.status(201).json(erc20);
};
export default { controller, validation };
