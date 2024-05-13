import { TwitterQuery } from '@thxnetwork/common/twitter';
import { Request, Response } from 'express';
import { body } from 'express-validator';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import TwitterDataProxy from '@thxnetwork/api/proxies/TwitterDataProxy';

const validation = [body('operators').customSanitizer((ops) => TwitterQuery.parse(ops))];

const controller = async (req: Request, res: Response) => {
    const account = await AccountProxy.findById(req.auth.sub);
    const query = TwitterQuery.create(req.body.operators);
    const posts = await TwitterDataProxy.search(account, query);

    res.json(posts);
};

export default { controller, validation };
