import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardNFTService from '@thxnetwork/api/services/RewardNFTService';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import { RewardNFTPayment } from '@thxnetwork/api/models/RewardNFTPayment';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const reward = await RewardNFTService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByPerk(reward);
    const pool = await PoolService.getById(req.header('X-PoolId'));
    const erc721 = await ERC721Service.findById(req.params.id);
    const payments = await RewardNFTPayment.find({ rewardId: reward._id });

    res.json({ ...reward.toJSON(), erc721, claims, payments, poolAddress: pool.safeAddress });
};

export default { controller, validation };
