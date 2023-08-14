import { CustomReward } from '@thxnetwork/api/models/CustomReward';
import { paginatedResults } from '@thxnetwork/api/util/pagination';
import { Request, Response } from 'express';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const page = req.query.page ? Number(req.query.page) : 1;
    const poolId = req.header('X-PoolId');
    const result = await paginatedResults(CustomReward, page, limit, { poolId });
    res.json(result);
};

export default { controller, validation };
