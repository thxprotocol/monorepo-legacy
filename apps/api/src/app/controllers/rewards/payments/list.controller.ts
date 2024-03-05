import RewardService from '@thxnetwork/api/services/RewardService';
import { Request, Response } from 'express';
import { query } from 'express-validator';

const validation = [query('walletId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const payments = await RewardService.findPaymentsForSub(req.auth.sub);
    res.json(payments);
};

export default { controller, validation };
