import { Request, Response } from 'express';
import { body } from 'express-validator';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [
    body('chainId').exists().isNumeric(),
    body('settings.title').optional().isString().trim().escape().isLength({ max: 50 }),
    body('startDate').optional({ nullable: true }).isString(),
    body('endDate').optional({ nullable: true }).isString(),
];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Pools']
    const { chainId, title, startDate, endDate } = req.body;
    const pool = await PoolService.deploy(req.auth.sub, chainId, title || 'My Quest Campaign', startDate, endDate);

    // Deploy a Safe for the campaign
    const poolId = String(pool._id);
    const safe = await SafeService.create({ chainId: req.body.chainId, sub: req.auth.sub, safeVersion, poolId });

    res.status(201).json({ ...pool.toJSON(), address: safe.address, safe });
};

export default { controller, validation };
