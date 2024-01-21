import { query } from 'express-validator';
import { Request, Response } from 'express';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { GitcoinQuest } from '@thxnetwork/api/models/GitcoinQuest';

const validation = [
    query('page').isInt(),
    query('limit').isInt(),
    query('isPublished')
        .optional()
        .isBoolean()
        .customSanitizer((value) => {
            return value && JSON.parse(value);
        }),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const poolId = req.header('X-PoolId');
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const $match = { poolId, isPublished: req.query.isPublished };
    const pipeline = [
        { $unionWith: { coll: ReferralReward.collection.name } },
        { $unionWith: { coll: PointReward.collection.name } },
        { $unionWith: { coll: MilestoneReward.collection.name } },
        { $unionWith: { coll: Web3Quest.collection.name } },
        { $unionWith: { coll: GitcoinQuest.collection.name } },
        { $match },
    ];
    const arr = await Promise.all(
        [DailyReward, ReferralReward, PointReward, MilestoneReward, Web3Quest, GitcoinQuest].map(
            async (model) => await model.countDocuments($match),
        ),
    );
    const total = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const results = await DailyReward.aggregate([
        ...pipeline,
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
