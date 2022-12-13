import { Response, Request, NextFunction } from 'express';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import PoolService from '@thxnetwork/api/services/PoolService';

export async function requireAssetPoolHeader(req: Request, _res: Response, next: NextFunction) {
    const id = req.header('X-PoolId');
    if (!id) throw new BadRequestError('Valid X-PoolId header is required for this request.');

    const assetPool = await PoolService.getById(id);
    if (!assetPool) throw new BadRequestError('Pool not found in database.');

    req.assetPool = assetPool;

    next();
}
