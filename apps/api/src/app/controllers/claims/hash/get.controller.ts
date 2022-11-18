import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardBaseService from '@thxnetwork/api/services/RewardBaseService';
import { RewardVariant } from '@thxnetwork/api/types/enums/RewardVariant';
import { RewardTokenDocument } from '@thxnetwork/api/models/RewardToken';
import { RewardCondition } from '@thxnetwork/api/types/RewardCondition';
import { RewardNftDocument } from '@thxnetwork/api/models/RewardNft';

const validation = [param('hash').isString()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Claims']
    const claim = await ClaimService.findByHash(req.params.hash);
    if (!claim) throw new NotFoundError('Could not find this claim');

    const pool = await AssetPoolService.getById(claim.poolId);
    if (!pool) throw new NotFoundError('Could not find this pool');

    const reward = await RewardBaseService.get(pool, claim.rewardId);
    if (!reward) throw new NotFoundError('Could not find this reward');

    if (reward.variant === RewardVariant.RewardToken && claim.erc20Id) {
        const erc20 = await ERC20Service.getById(claim.erc20Id);

        const rewardToken = (await reward.getReward()) as RewardTokenDocument;
        res.json({
            _id: claim._id,
            id: claim.id,
            poolId: claim.poolId,
            erc20Id: claim.erc20Id,
            erc721Id: claim.erc721Id,
            rewardId: claim.rewardId,
            withdrawAmount: rewardToken.amount,
            withdrawCondition: await RewardCondition.findById(rewardToken.rewardConditionId),
            chainId: pool.chainId,
            clientId: pool.clientId,
            poolAddress: pool.address,
            tokenSymbol: erc20.symbol,
        });
    } else if (reward.variant === RewardVariant.RewardNFT && claim.erc721Id) {
        const erc721 = await ERC721Service.findById(claim.erc721Id);
        const tokenSymbol = erc721.symbol;
        const rewardNft = (await reward.getReward()) as RewardNftDocument;
        res.json({
            _id: claim._id,
            id: claim.id,
            poolId: claim.poolId,
            erc721Id: claim.erc721Id,
            rewardId: claim.rewardId,
            withdrawCondition: await RewardCondition.findById(rewardNft.rewardConditionId),
            chainId: pool.chainId,
            clientId: pool.clientId,
            poolAddress: pool.address,
            tokenSymbol,
        });
    }
};

export default { controller, validation };
