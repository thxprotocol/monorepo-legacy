import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { TwitterQuery } from '@thxnetwork/api/models';
import { TwitterQuery as TwitterQueryParser } from '@thxnetwork/common/twitter';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import TwitterQueryService from '@thxnetwork/api/services/TwitterQueryService';

const validation = [param('id').isMongoId(), body('operators').customSanitizer((ops) => TwitterQueryParser.parse(ops))];

const controller = async (req: Request, res: Response) => {
    const query = TwitterQueryParser.create(req.body.operators);

    // 512 is the max length for X API queries within the Basic plan
    if (query.length > 512) {
        throw new BadRequestError('Your query is too long! Please remove some fields.');
    }

    const twitterQuery = await TwitterQuery.create({
        poolId: req.params.id,
        operators: req.body.operators,
        defaults: req.body.defaults,
        query,
    });

    // Search initial posts and create quests
    await TwitterQueryService.run([twitterQuery]);

    res.status(201).json(twitterQuery);
};

export { controller, validation };
