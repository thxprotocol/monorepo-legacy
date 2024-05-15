import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { JobType, RewardVariant } from '@thxnetwork/common/enums';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import RewardService from '@thxnetwork/api/services/RewardService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { agenda } from '@thxnetwork/api/util/agenda';
import { Wallet } from '@thxnetwork/api/models';

const validation = [param('variant').isInt(), param('rewardId').isMongoId(), body('walletId').optional().isMongoId()];

const controller = async (req: Request, res: Response) => {
    const variant = req.params.variant as unknown as RewardVariant;
    const rewardId = req.params.rewardId as string;

    const reward = await RewardService.findById(variant, rewardId);
    if (!reward) throw new NotFoundError('Reward not found');

    const pool = await PoolService.getById(reward.poolId);
    if (!pool) throw new NotFoundError('Campaign not found');

    const safe = await SafeService.findOneByPool(pool);
    if (!safe) throw new NotFoundError('Campaign Safe not found');

    const account = await AccountProxy.findById(req.auth.sub);
    if (!account) throw new NotFoundError('Account not found');

    const wallet = req.body.walletId ? await Wallet.findById(req.body.walletId) : null;
    const validationResult = await RewardService.getValidationResult({ reward, account, safe, wallet });
    if (!validationResult.result) {
        throw new ForbiddenError(validationResult.reason);
    }

    // Serialize payment processing with job queue
    const job = await agenda.now(JobType.CreateRewardPayment, {
        variant,
        rewardId,
        sub: account.sub,
        walletId: req.body.walletId,
    });

    res.json({ jobId: job.attrs._id });
};

export { controller, validation };
