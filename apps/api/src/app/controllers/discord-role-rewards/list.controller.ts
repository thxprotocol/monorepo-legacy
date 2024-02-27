import { Request, Response } from 'express';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { RewardDiscordRolePayment, RewardDiscordRole, RewardDiscordRoleDocument } from '@thxnetwork/api/models';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const rewards = await paginatedResults(RewardDiscordRole, page, limit, { poolId });

    rewards.results = await Promise.all(
        rewards.results.map(async (r: RewardDiscordRoleDocument) => {
            const payments = await RewardDiscordRolePayment.find({ poolId, rewardId: String(r._id) });
            return { ...r.toJSON(), payments };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
