import { Request, Response } from 'express';
import { param, body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

const validation = [param('id').isMongoId(), body('email').isEmail()];

const controller = async (req: Request, res: Response) => {
    const pool = await PoolService.getById(req.params.id);
    const collaborator = await PoolService.inviteCollaborator(pool, req.body.email);

    res.json(collaborator);
};

export { controller, validation };
