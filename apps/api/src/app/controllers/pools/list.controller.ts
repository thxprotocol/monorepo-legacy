import { Request, Response } from 'express';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { query } from 'express-validator';

export const validation = [query('archived').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const archived = JSON.parse(req.query.archived as string);
    const pools = await AssetPoolService.getAllBySub(req.auth.sub, archived);
    const list = pools.map((pool: AssetPoolDocument) => pool._id);

    res.json(list);
};

export default { controller, validation };
