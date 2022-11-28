import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import { findRewardById, isTERC20Reward, isTERC721Reward } from '@thxnetwork/api/util/rewards';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import ClaimService from '@thxnetwork/api/services/ClaimService';

const validation = [param('hash').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Claims']
    const claim = await ClaimService.findByHash(req.params.hash);
    if (!claim) throw new NotFoundError('Could not find this claim');

    const pool = await AssetPoolService.getById(claim.poolId);
    if (!pool) throw new NotFoundError('Could not find this pool');

    const reward = await findRewardById(claim.rewardId);
    if (!reward) throw new NotFoundError('Could not find this reward');

    if (isTERC20Reward(reward) && claim.erc20Id) {
        const erc20 = await ERC20Service.getById(claim.erc20Id);
        res.json({
            _id: claim._id,
            id: claim.id,
            poolId: claim.poolId,
            erc20Id: claim.erc20Id,
            erc721Id: claim.erc721Id,
            rewardId: claim.rewardId,
            chainId: pool.chainId,
            clientId: pool.clientId,
            poolAddress: pool.address,
            tokenSymbol: erc20.symbol,
            ...reward.toJSON(),
        });
    } else if (isTERC721Reward(reward) && claim.erc721Id) {
        const erc721 = await ERC721Service.findById(claim.erc721Id);
        res.json({
            _id: claim._id,
            id: claim.id,
            poolId: claim.poolId,
            erc20Id: claim.erc20Id,
            erc721Id: claim.erc721Id,
            rewardId: claim.rewardId,
            chainId: pool.chainId,
            clientId: pool.clientId,
            poolAddress: pool.address,
            tokenSymbol: erc721.symbol,
            ...reward.toJSON(),
        });
    }
};

export default { controller, validation };
