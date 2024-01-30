import { Request, Response } from 'express';
import { param } from 'express-validator';
import { Job } from '@thxnetwork/api/models/Job';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const job = await Job.findById(req.params.id);
    res.json(job);
};

export default { controller, validation };
