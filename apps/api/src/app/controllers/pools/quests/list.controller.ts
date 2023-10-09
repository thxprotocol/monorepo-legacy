import { query } from 'express-validator';
import { Request, Response } from 'express';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';

const validation = [query('page').isInt(), query('limit').isInt(), query('isPublished').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const poolId = req.header('X-PoolId');
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const $match = { poolId };
    if (req.query.isPublished) {
        $match['isPublished'] = JSON.parse(req.query.isPublished as string);
    }
    const query = [
        { $unionWith: { coll: ReferralReward.collection.name } },
        { $unionWith: { coll: PointReward.collection.name } },
        { $unionWith: { coll: MilestoneReward.collection.name } },
        { $unionWith: { coll: Web3Quest.collection.name } },
        { $match },
    ];
    const total = await DailyReward.countDocuments(query);
    const results = await DailyReward.aggregate([
        ...query,
        { $sort: { index: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
    ]);

    res.json({
        total,
        limit,
        page,
        results,
    });
};

export default { controller, validation };
