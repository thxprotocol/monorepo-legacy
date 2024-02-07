import { Request, Response } from 'express';
import { AccountService } from '../../services/AccountService';
import { param } from 'express-validator';

const validation = [param('sub').isMongoId()];

const controller = async (req: Request, res: Response) => {
    await AccountService.remove(req.auth.sub);
    res.status(204).end();
};

export default { controller, validation };
