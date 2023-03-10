import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [param('id').isMongoId(), param('discordId').isString()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const account: any = await AccountProxy.getByDiscordId(req.params.discordId);
    if (pool.sub !== account._id) return res.status(400).end();

    res.json(pool);
};

export default { controller, validation };
