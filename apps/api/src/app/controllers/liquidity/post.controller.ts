import LiquidityService from '@thxnetwork/api/services/LiquidityService';
import { Request, Response } from 'express';
import { query, body } from 'express-validator';

const validation = [
    body('usdcAmountInWei').isString(),
    body('thxAmountInWei').isString(),
    body('slippage').isString(),
    query('walletId').isMongoId(),
];

const controller = async ({ wallet, body }: Request, res: Response) => {
    const tx = await LiquidityService.create(wallet, body.usdcAmountInWei, body.thxAmountInWei, body.slippage);

    res.status(201).json([tx]);
};
export { controller, validation };
