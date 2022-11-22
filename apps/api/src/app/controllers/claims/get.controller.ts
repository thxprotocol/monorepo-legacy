import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import { Claim } from '@thxnetwork/api/models/Claim';
import RewardBaseService from '@thxnetwork/api/services/RewardBaseService';
import { RewardCondition } from '@thxnetwork/api/types/RewardCondition';
import { RewardTokenDocument } from '@thxnetwork/api/models/RewardToken';
import { RewardVariant } from '@thxnetwork/api/types/enums/RewardVariant';
import { RewardNftDocument } from '@thxnetwork/api/models/RewardNft';

const validation = [param('id').exists().isString()];

const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Claims']
    #swagger.responses[200] = { 
        description: 'Get a reward claim',
        schema: { $ref: '#/definitions/Claim' } 
    }
    */
    let claim = await ClaimService.findById(req.params.id);
    if (!claim) {
        // maintain compatibility with old the claim urls
        claim = await Claim.findById(req.params.id);
    }
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
            rewardId: claim.rewardId,
            withdrawAmount: rewardToken.withdrawAmount,
            withdrawCondition: await RewardCondition.findById(rewardToken.rewardConditionId),
            chainId: pool.chainId,
            clientId: pool.clientId,
            poolAddress: pool.address,
            tokenSymbol: erc20.symbol,
        });
    } else if (reward.variant === RewardVariant.RewardNFT && claim.erc721Id) {
        let nftImageUrl, nftTitle, nftDescription;
        const erc721 = await ERC721Service.findById(claim.erc721Id);
        const rewardNft = (await reward.getReward()) as RewardNftDocument;

        const metadata = await ERC721Service.findMetadataById(rewardNft.erc721metadataId);
        if (metadata) {
            nftTitle = metadata.title;
            nftDescription = metadata.description;
            if (erc721.properties.length && metadata.attributes.length) {
                const allImageProps = erc721.properties.filter((p) => p.propType === 'image');
                if (allImageProps.length) {
                    const imageAttribute = metadata.attributes.find((x) => x.key === allImageProps[0].name);
                    if (imageAttribute) {
                        nftImageUrl = imageAttribute.value;
                    }
                }
            }
        }

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
            tokenSymbol: erc721.symbol,
            nftTitle,
            nftDescription,
            nftImageUrl,
        });
    }
};

export default { controller, validation };
