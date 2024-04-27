import { body, param } from 'express-validator';
import { Request, Response } from 'express';
import { TwitterQuery } from '@thxnetwork/api/models';
import { TwitterQuery as TwitterQueryParser } from '@thxnetwork/common/twitter';

const validation = [
    param('id').isMongoId(),
    param('queryId').isMongoId(),
    body('operators').customSanitizer((ops) => TwitterQueryParser.parse(ops)),
];

const controller = async (req: Request, res: Response) => {
    const query = TwitterQueryParser.create(req.body.operators);
    const twitterQuery = await TwitterQuery.findByIdAndUpdate(req.params.queryId, {
        operators: req.body.operators,
        query,
    });

    res.json(twitterQuery);
};

export default { controller, validation };
