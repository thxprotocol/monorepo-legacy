import { Request, Response } from 'express';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { param } from 'express-validator';
import { ForbiddenError } from '@thxnetwork/api/util/errors';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const poolId = req.header('X-PoolId');
    const quest = await Web3Quest.findById(req.params.id);
    if (quest.poolId !== poolId) throw new ForbiddenError('Not your custom reward.');

    await quest.deleteOne();

    res.status(204).end();
};

export default { controller, validation };
