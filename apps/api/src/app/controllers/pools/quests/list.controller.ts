import { param, query } from 'express-validator';
import { Request, Response } from 'express';
import {
    QuestInvite,
    QuestSocial,
    QuestCustom,
    QuestWeb3,
    QuestGitcoin,
    QuestDaily,
    QuestWebhook,
} from '@thxnetwork/api/models';

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
        { $unionWith: { coll: QuestInvite.collection.name } },
        { $unionWith: { coll: QuestSocial.collection.name } },
        { $unionWith: { coll: QuestCustom.collection.name } },
        { $unionWith: { coll: QuestWeb3.collection.name } },
        { $unionWith: { coll: QuestGitcoin.collection.name } },
        { $unionWith: { coll: QuestWebhook.collection.name } },
        { $match },
    ];
    const arr = await Promise.all(
        [QuestDaily, QuestInvite, QuestSocial, QuestCustom, QuestWeb3, QuestGitcoin, QuestWebhook].map(
            async (model) => await model.countDocuments($match),
        ),
    );
    const total = arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    const results = await QuestDaily.aggregate([
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
