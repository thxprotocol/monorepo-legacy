import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const guilds = await PoolService.findGuilds(pool);
    res.json(guilds);
};

export default { controller, validation };
