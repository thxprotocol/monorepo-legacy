import { Request, Response } from 'express';
import { body } from 'express-validator';
import { getChainId, safeVersion } from '@thxnetwork/api/services/ContractService';
import PoolService from '@thxnetwork/api/services/PoolService';
import SafeService from '@thxnetwork/api/services/SafeService';

const validation = [body('settings.title').optional().isString().trim().escape().isLength({ max: 50 })];

const controller = async (req: Request, res: Response) => {
    const { title } = req.body;
    const pool = await PoolService.deploy(req.auth.sub, title || 'My Quest Campaign');

    // Deploy a Safe for the campaign
    const poolId = String(pool._id);
    const chainId = getChainId();
    const safe = await SafeService.create({ chainId, sub: req.auth.sub, safeVersion, poolId });

    // Update predicted safe address for pool
    await pool.updateOne({ safeAddress: safe.address });

    res.status(201).json({ ...pool.toJSON(), safeAddress: safe.address, safe });
};

export default { controller, validation };
