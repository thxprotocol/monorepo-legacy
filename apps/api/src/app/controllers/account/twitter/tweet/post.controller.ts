import { Request, Response } from 'express';
import { body } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';

const validation = [body('tweetId').isString()];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    const tweet = await TwitterDataProxy.getTweet(account, req.body.tweetId);

    res.json(tweet);
};

export default { controller, validation };
