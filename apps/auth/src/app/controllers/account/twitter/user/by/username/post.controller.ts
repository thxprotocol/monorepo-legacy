import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { TwitterService } from '../../../../../../services/TwitterService';
import { Account } from '../../../../../../models/Account';

const validation = [param('sub').isMongoId(), body('username').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.sub);
    const user = await TwitterService.getUserByUsername(account, req.body.username);
    res.json(user);
};

export default { controller, validation };