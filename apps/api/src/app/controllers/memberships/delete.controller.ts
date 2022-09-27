import { Request, Response } from 'express';
import { param } from 'express-validator';
import MembershipService from '@thxnetwork/api/services/MembershipService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Memberships']
    await MembershipService.remove(req.params.id);
    res.status(204).end();
};

export default { controller, validation };
