import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import ERC721PerkService from '@thxnetwork/api/services/ERC721PerkService';

const validation = [param('id').exists()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['RewardsNft']
    const reward = await ERC721PerkService.get(req.params.id);
    if (!reward) throw new NotFoundError();

    const claims = await ClaimService.findByReward(reward);
    const withdrawals = await WithdrawalService.findByQuery({
        poolId: String(req.assetPool._id),
        rewardId: reward._id,
    });

    res.json({ ...reward.toJSON(), claims, poolAddress: req.assetPool.address, progress: withdrawals.length });
};

export default { controller, validation };
