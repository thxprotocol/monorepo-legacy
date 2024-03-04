import { param, query } from 'express-validator';
import { Request, Response } from 'express';
import { RewardNFT, RewardCoupon, RewardCoin, RewardDiscordRole, RewardCustom } from '@thxnetwork/api/models';

const validation = [
    param('id').isMongoId(),
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
    const poolId = req.params.id;
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);
    const $match = { poolId, isPublished: req.query.isPublished };
    const pipeline = [
        { $unionWith: { coll: RewardNFT.collection.name } },
        { $unionWith: { coll: RewardCoupon.collection.name } },
        { $unionWith: { coll: RewardCustom.collection.name } },
        { $unionWith: { coll: RewardDiscordRole.collection.name } },
        { $match },
    ];
    const arr = await Promise.all(
        [RewardCoin, RewardNFT, RewardCoupon, RewardCustom, RewardDiscordRole].map(
            async (model) => await model.countDocuments($match),
        ),
    );
    const total = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const results = await RewardCoin.aggregate([
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
