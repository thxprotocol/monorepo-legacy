import { Request, Response } from 'express';
import { body } from 'express-validator';
import PoolService from '@thxnetwork/api/services/PoolService';

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

    res.status(201).json(pool);
};

export default { controller, validation };
