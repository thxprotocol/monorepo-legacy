import { Request, Response } from 'express';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Withdrawals']
    const withdrawal = await WithdrawalService.getById(req.params.id);
    if (!withdrawal) throw new NotFoundError();

    const transactions = await Promise.all(
        withdrawal.transactions.map(async (id) => {
            return await TransactionService.getById(id);
        }),
    );

    res.json({ ...withdrawal.toJSON(), poolAddress: req.assetPool.address, transactions, id: String(withdrawal._id) });
};

export default { controller, validation };
