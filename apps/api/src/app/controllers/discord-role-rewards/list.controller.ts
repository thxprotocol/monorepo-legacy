import { DiscordRoleReward, DiscordRoleRewardDocument } from '@thxnetwork/api/models/DiscordRoleReward';
import { DiscordRoleRewardPayment } from '@thxnetwork/api/models/DiscordRoleRewardPayment';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { Request, Response } from 'express';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const poolId = req.header('X-PoolId');
    const rewards = await paginatedResults(DiscordRoleReward, page, limit, { poolId });

    rewards.results = await Promise.all(
        rewards.results.map(async (r: DiscordRoleRewardDocument) => {
            const payments = await DiscordRoleRewardPayment.find({ poolId, perkId: String(r._id) });
            return { ...r.toJSON(), payments };
        }),
    );

    res.json(rewards);
};

export default { controller, validation };
