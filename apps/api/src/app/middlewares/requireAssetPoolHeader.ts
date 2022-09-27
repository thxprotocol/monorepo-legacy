import { Response, Request, NextFunction } from 'express';
import { BadRequestError } from '@thxnetwork/api/util/errors';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';

export async function requireAssetPoolHeader(req: Request, _res: Response, next: NextFunction) {
    const id = req.header('X-PoolId');
    if (!id) throw new BadRequestError('Valid X-PoolId header is required for this request.');

    const assetPool = await AssetPoolService.getById(id);
    if (!assetPool) throw new BadRequestError('Pool not found in database.');

    req.assetPool = assetPool;

    next();
}
