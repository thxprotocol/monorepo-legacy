import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError, UnauthorizedError } from '@thxnetwork/api/util/errors';
import PaymentService from '@thxnetwork/api/services/PaymentService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { Promotion } from '@thxnetwork/api/models/Promotion';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { Membership } from '@thxnetwork/api/models/Membership';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

const validation = [param('id').exists().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Payments']
    const payment = await PaymentService.get(req.params.id);
    if (!payment) throw new NotFoundError();
    if (payment.token !== req.header('X-Payment-Token')) throw new UnauthorizedError('Payment Token is incorrect');

    const erc20 = await ERC20Service.findBy({ address: payment.tokenAddress, chainId: payment.chainId });
    const failReason = await TransactionService.findFailReason(payment.transactions);

    let metadata;
    if (payment.metadataId) {
        metadata = await ERC721Metadata.findById(payment.metadataId);
    }

    let promotion, membership;
    if (payment.promotionId) {
        promotion = await Promotion.findById(payment.promotionId);
        if (payment.sender) {
            const account = await AccountProxy.getByAddress(payment.sender);
            if (account) {
                membership = await Membership.findOne({ poolId: payment.poolId, sub: account.sub });
            }
        }
    }

    res.json({ ...payment.toJSON(), metadata, promotion, membership, failReason, tokenSymbol: erc20.symbol });
};

export default { validation, controller };
