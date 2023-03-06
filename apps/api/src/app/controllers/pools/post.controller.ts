import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Widget } from '@thxnetwork/api/models/Widget';
import { v4 } from 'uuid';

const validation = [body('chainId').exists().isNumeric(), body('title').optional().isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const title = req.body.title || 'My Loyalty Pool';
    const pool = await PoolService.deploy(req.auth.sub, req.body.chainId, title);

    await Widget.create({
        poolId: pool._id,
        uuid: v4(),
        align: 'right',
        message: 'Hi there!👋 Click me to earn rewards and collect crypto perks...',
        domain: '',
        color: '#FFFFFF',
        bgColor: '#5942C1',
        theme: 'dark',
    });

    res.status(201).json(pool);
};

export default { controller, validation };
