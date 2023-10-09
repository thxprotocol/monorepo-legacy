import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import { Account } from '@thxnetwork/auth/models/Account';
import { TwitterService } from '@thxnetwork/auth/services/TwitterService';

const validation = [param('sub').isMongoId(), body('tweetId').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await Account.findById(req.params.sub);
    const tweet = await TwitterService.getTweet(account, req.body.tweetId);
    res.json(tweet);
};

export default { controller, validation };
