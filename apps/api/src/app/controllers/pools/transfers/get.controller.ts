import PoolService from '@thxnetwork/api/services/PoolService';
import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { PoolTransfer } from '@thxnetwork/api/models/PoolTransfer';

const validation = [param('id').isMongoId(), param('token').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const pool = await PoolService.getById(req.params.id);
    if (!pool) throw new NotFoundError('The pool for this transfer URL no longer exists.');

    const poolTransfer = await PoolTransfer.findOne({ token: req.params.token });
    if (!poolTransfer) throw new NotFoundError('This pool transfer URL no longer exists.');

    res.json({ ...poolTransfer.toJSON(), now: Date.now() });
};

export default { controller, validation };
