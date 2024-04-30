import { Request, Response } from 'express';
import { TwitterQuery } from '@thxnetwork/api/models';
import { param } from 'express-validator';
import TwitterQueryService from '@thxnetwork/api/services/TwitterQueryService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const queries = await TwitterQueryService.list({ poolId: req.params.id });
    res.json(queries);
};

export default { controller, validation };
