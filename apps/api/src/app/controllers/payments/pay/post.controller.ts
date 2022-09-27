import { Request, Response } from 'express';
import { param } from 'express-validator';
import {
    AmountExceedsAllowanceError,
    ForbiddenError,
    InsufficientBalanceError,
    NotFoundError,
    UnauthorizedError,
} from '@thxnetwork/api/util/errors';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import PaymentService from '@thxnetwork/api/services/PaymentService';
import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { getProvider } from '@thxnetwork/api/util/network';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Payments']
    let payment = await PaymentService.get(req.params.id);

    if (!payment) {
        throw new NotFoundError();
    }
    if (payment.token !== req.header('X-Payment-Token')) {
        throw new UnauthorizedError('Payment access token is incorrect');
    }
    if (payment.state === PaymentState.Pending) {
        throw new ForbiddenError('Payment state is pending');
    }
    if (payment.state === PaymentState.Completed) {
        throw new ForbiddenError('Payment state is completed');
    }

    // const { call, nonce, sig } = req.body;
    const { defaultAccount } = getProvider(payment.chainId);
    const erc20 = await ERC20Service.findByPool(req.assetPool);
    const contract = getContractFromName(req.assetPool.chainId, 'LimitedSupplyToken', erc20.address);

    // Recover signer from message
    const account = await AccountProxy.getById(req.auth.sub);
    payment.sender = account.address;

    // Check balance to ensure throughput
    const balance = await contract.methods.balanceOf(payment.sender).call();
    if (Number(balance) < Number(payment.amount)) throw new InsufficientBalanceError();

    // Check allowance to ensure throughput
    const allowance = Number(await contract.methods.allowance(payment.sender, defaultAccount).call());
    if (Number(allowance) < Number(payment.amount)) throw new AmountExceedsAllowanceError();

    payment = await PaymentService.pay(contract, payment);
    res.json(await payment.save());
};

export default {
    validation,
    controller,
};
