import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Participant } from '@thxnetwork/api/models/Participant';
import { RewardVariant } from '@thxnetwork/common/enums';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import RewardService from '@thxnetwork/api/services/RewardService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [param('variant').isInt(), param('rewardId').isMongoId(), body('walletId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as RewardVariant;
    const rewardId = req.params.rewardId as string;

    const reward = await RewardService.findById(variant, rewardId);
    if (!reward) throw new NotFoundError('Reward not found');
    if (!reward.pointPrice) throw new NotFoundError('Reward has no point price and cannot be purchased');

    const pool = await PoolService.getById(reward.poolId);
    if (!pool) throw new NotFoundError('Campaign not found');

    const safe = await SafeService.findOneByPool(pool, pool.chainId);
    if (!safe) throw new NotFoundError('Campaign Safe not found');

    const account = await AccountProxy.findById(req.auth.sub);
    if (!account) throw new NotFoundError('Account not found');

    const participant = await Participant.findOne({ sub: account.sub, poolId: pool._id });
    if (!participant) new NotFoundError('Participant not found');
    if (Number(participant.balance) < Number(reward.pointPrice)) {
        throw new BadRequestError('Participant has insufficient points');
    }

    const validationResult = await RewardService.getValidationResult({ reward, account, safe });
    if (!validationResult.result) {
        throw new ForbiddenError(validationResult.reason);
    }

    // If walletId is in the body we fetch the wallet for the user as it will
    // be used when processing the payment.
    const wallet = req.body.walletId ? await SafeService.findById(req.body.walletId) : null;
    const payment = await RewardService.createPayment(reward.variant, { pool, account, reward, wallet, safe });

    res.status(201).json(payment);
};

export default { controller, validation };
