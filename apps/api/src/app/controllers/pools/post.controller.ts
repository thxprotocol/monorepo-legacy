import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Widget } from '@thxnetwork/api/models/Widget';
import { v4 } from 'uuid';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/types/contants';

const validation = [
    body('chainId').exists().isNumeric(),
    body('title').optional().isString(),
    body('endDate').optional().isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const title = req.body.title || 'My Loyalty Pool';
    const endDate = req.body.endDate ? new Date(req.body.endDate) : undefined;
    const pool = await PoolService.deploy(req.auth.sub, req.body.chainId, title, endDate);

    await Widget.create({
        uuid: v4(),
        poolId: pool._id,
        align: 'right',
        message: 'Hi there!👋 Click me to earn rewards and collect digital perks...',
        domain: 'https://www.example.com',
        theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
    });

    res.status(201).json(pool);
};

export default { controller, validation };
