import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { Claim } from '@thxnetwork/api/models/Claim';
import { findRewardByUuid, isTERC20Reward, isTERC721Reward } from '@thxnetwork/api/util/rewards';

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
    if (!claim) throw new NotFoundError('Could not find this claim');

    const pool = await AssetPoolService.getById(claim.poolId);
    if (!pool) throw new NotFoundError('Could not find this pool');

    const reward = await findRewardByUuid(claim.rewardId);
    if (!reward) throw new NotFoundError('Could not find this reward');

    if (isTERC20Reward(reward) && claim.erc20Id) {
        const erc20 = await ERC20Service.getById(claim.erc20Id);

        return res.json({ erc20, claim, pool, reward });
    }

    if (isTERC721Reward(reward) && claim.erc721Id) {
        const erc721 = await ERC721Service.findById(claim.erc721Id);
        const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);

        return res.json({ erc721, metadata, claim, pool, reward });
    }
};

export default { controller, validation };
