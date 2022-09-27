import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import PaymentService from '@thxnetwork/api/services/PaymentService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import TransactionService from '@thxnetwork/api/services/TransactionService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Payments']
    const payment = await PaymentService.get(req.params.id);
    if (!payment) throw new NotFoundError();
    if (payment.token !== req.header('X-Payment-Token')) throw new UnauthorizedError('Payment Token is incorrect');

    const erc20 = await ERC20Service.findBy({ address: payment.tokenAddress, chainId: payment.chainId });
    const failReason = await TransactionService.findFailReason(payment.transactions);

    res.json({ ...payment.toJSON(), failReason, tokenSymbol: erc20.symbol });
};

export default { validation, controller };
