import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ShopifyPerkService from '@thxnetwork/api/services/ShopifyPerkService';
import PoolService from '@thxnetwork/api/services/PoolService';
import { ShopifyPerkPayment } from '@thxnetwork/api/models/ShopifyPerkPayment';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsShopify']
    const reward = await ShopifyPerkService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByPerk(reward);
    const payments = await ShopifyPerkPayment.find({ perkId: reward._id });
    const pool = await PoolService.getById(req.header('X-PoolId'));

    res.json({ ...reward.toJSON(), claims, poolAddress: pool.address, payments });
};

export default { controller, validation };
