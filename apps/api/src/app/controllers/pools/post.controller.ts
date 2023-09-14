import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';
import { Widget } from '@thxnetwork/api/models/Widget';
import { v4 } from 'uuid';
import { DEFAULT_COLORS, DEFAULT_ELEMENTS } from '@thxnetwork/types/contants';

const validation = [
    body('chainId').exists().isNumeric(),
    body('settings.title').optional().isString().trim().escape().isLength({ max: 50 }),
    body('startDate').optional({ nullable: true }).isString(),
    body('endDate').optional({ nullable: true }).isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { chainId, title, startDate, endDate } = req.body;
    const pool = await PoolService.deploy(
        req.auth.sub,
        chainId,
        title || 'My Loyalty Campaign',
        true,
        true,
        startDate,
        endDate,
    );

    await Widget.create({
        uuid: v4(),
        poolId: pool._id,
        align: 'right',
        message: 'Hi there!👋 Click me to complete quests and earn rewards...',
        domain: 'https://www.example.com',
        theme: JSON.stringify({ elements: DEFAULT_ELEMENTS, colors: DEFAULT_COLORS }),
    });

    res.status(201).json(pool);
};

export default { controller, validation };
