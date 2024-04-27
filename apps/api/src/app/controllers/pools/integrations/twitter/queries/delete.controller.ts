import { param } from 'express-validator';
import { Request, Response } from 'express';
import { TwitterQuery } from '@thxnetwork/api/models';
import { ForbiddenError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId(), param('queryId').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const query = await TwitterQuery.findById(req.params.queryId);
    if (query.poolId !== req.params.id) throw new ForbiddenError('Not your quest.');

    await TwitterQuery.findByIdAndDelete(req.params.queryId);

    res.status(204).end();
};

export default { controller, validation };
