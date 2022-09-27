import { Request, Response } from 'express';
import { DepositDocument } from '@thxnetwork/api/models/Deposit';
import DepositService from '@thxnetwork/api/services/DepositService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Deposits']
    const deposits = await DepositService.getAll(req.assetPool);
    const result = deposits.map((deposit: DepositDocument) => deposit.toJSON());

    res.json(result);
};

export default { controller };
