import { Request, Response } from 'express';
import { param } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';

export const validation = [param('id').isMongoId(), param('discordId').isString()];

export const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    const account = await AccountProxy.getByDiscordId(req.params.discordId);

    if (pool.sub === (account as any)._id) return res.json(pool);
    res.status(400).send();
};

export default { controller, validation };
