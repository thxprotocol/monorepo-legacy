import { QRCodeEntry, RewardNFT } from '@thxnetwork/api/models';
import { ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { Request, Response } from 'express';
import { query } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [query('rewardId').isMongoId(), query('page').isInt(), query('limit').isInt()];

const controller = async (req: Request, res: Response) => {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const rewardId = req.query.rewardId;

    const reward = await RewardNFT.findById(rewardId);
    if (!reward) throw new NotFoundError('Reward not found');

    const isAllowed = await PoolService.isSubjectAllowed(req.auth.sub, reward.poolId);
    if (!isAllowed) throw new ForbiddenError('Reward not accessible.');

    const total = await QRCodeEntry.countDocuments({ rewardId });
    const entries = await QRCodeEntry.find({ rewardId })
        .limit(limit)
        .skip((page - 1) * limit);
    const subs = entries.map(({ sub }) => sub);
    const accounts = await AccountProxy.find({ subs });
    const results = entries.map((entry) => {
        const account = accounts.find((account) => account.sub === entry.sub);
        return Object.assign(entry.toJSON(), { account });
    });
    const meta = {
        participantCount: await QRCodeEntry.countDocuments({ rewardId, sub: { $exists: true } }),
    };

    res.json({
        total,
        limit,
        page,
        results,
        meta,
    });
};

export default { controller, validation };
