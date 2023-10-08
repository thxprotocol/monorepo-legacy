import { Request, Response } from 'express';
import { PaginationResult } from '@thxnetwork/api/util/pagination';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';
import PoolService from '@thxnetwork/api/services/PoolService';

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Quest Social']
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const quests: PaginationResult = await PointRewardService.findByPool(
        pool,
        Number(req.query.page),
        Number(req.query.limit),
    );

    quests.results = await Promise.all(
        quests.results.map(async (quest, i) => {
            const entries = await PointRewardService.findEntries(quest);
            return { ...quest.toJSON(), entries };
        }),
    );

    res.json(quests);
};

export default { controller };
