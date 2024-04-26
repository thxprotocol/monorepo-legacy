import { Request, Response } from 'express';
import { TwitterQuery } from '@thxnetwork/api/models';
import { param } from 'express-validator';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const rules = await TwitterQuery.find({ poolId: req.params.id });

    res.json(rules);
};

export default { controller, validation };
