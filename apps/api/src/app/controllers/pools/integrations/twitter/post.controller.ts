import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { TwitterQuery } from '@thxnetwork/api/models';
import { TwitterQuery as TwitterQueryParser } from '@thxnetwork/common/twitter';
import PoolService from '@thxnetwork/api/services/PoolService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import TwitterQueryService from '@thxnetwork/api/services/TwitterQueryService';

const validation = [param('id').isMongoId(), body('operators').customSanitizer((ops) => TwitterQueryParser.parse(ops))];

const controller = async (req: Request, res: Response) => {
    const query = TwitterQueryParser.create(req.body.operators);
    const twitterQuery = await TwitterQuery.create({
        poolId: req.params.id,
        operators: req.body.operators,
        query,
    });
    const pool = await PoolService.getById(twitterQuery.poolId);
    const account = await AccountProxy.findById(pool.sub);

    await TwitterQueryService.run(account, twitterQuery);

    res.status(201).end();
};

export default { controller, validation };
