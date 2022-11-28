import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { Claim } from '@thxnetwork/api/models/Claim';
import { findRewardById, isTERC20Reward, isTERC721Reward } from '@thxnetwork/api/util/rewards';

const validation = [param('id').exists().isString()];

const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Claims']
    #swagger.responses[200] = { 
        description: 'Get a reward claim',
        schema: { $ref: '#/definitions/Claim' } 
    }
    */
    const claim = await Claim.findOne({ id: req.params.id });
    console.log(claim);
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
            rewardId: claim.rewardId,
            withdrawAmount: reward.amount,
            chainId: pool.chainId,
            clientId: pool.clientId,
            poolAddress: pool.address,
            tokenSymbol: erc20.symbol,
        });
    } else if (isTERC721Reward(reward) && claim.erc721Id) {
        let nftImageUrl, nftTitle, nftDescription;
        const erc721 = await ERC721Service.findById(claim.erc721Id);
        const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);

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
