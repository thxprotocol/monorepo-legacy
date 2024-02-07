import { Request, Response } from 'express';
import { param, body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

export const validation = [param('id').isMongoId(), body('email').isEmail()];

export const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const collaborator = await PoolService.inviteCollaborator(pool, req.body.email);

    res.json(collaborator);
};

export default { controller, validation };
