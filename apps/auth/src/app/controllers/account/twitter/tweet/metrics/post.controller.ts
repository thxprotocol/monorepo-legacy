import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { Account } from '@thxnetwork/auth/models/Account';
import { TwitterService } from '@thxnetwork/auth/services/TwitterService';
import { UnauthorizedError } from '@thxnetwork/auth/util/errors';

const validation = [param('sub').isMongoId(), body('tweetIds').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.sub);
    const isAuthorized = await TwitterService.isAuthorized(account);
    if (!isAuthorized) throw new UnauthorizedError();
    const metrics = await TwitterService.getTweetMetrics(account, JSON.parse(req.body.tweetIds));

    res.json(metrics);
};

export default { controller, validation };
