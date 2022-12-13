import PoolService from '@thxnetwork/api/services/PoolService';
import Bluebird from 'bluebird';
import { Response, Request } from 'express';

export const getAssetPoolVersions = async (req: Request, res: Response) => {
    // #swagger.tags = ['Health']
    const assetPools = await PoolService.getAll();

    const data: Record<string, any> = {};
    assetPools.forEach((assetPool) => {
        data[assetPool.address] = PoolService.contractVersionVariant(assetPool);
    });

    res.header('Content-Type', 'application/json').send(JSON.stringify(await Bluebird.props(data), null, 4));
};
