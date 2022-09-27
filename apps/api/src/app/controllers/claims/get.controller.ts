import { Request, Response } from 'express';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { param } from 'express-validator';
import RewardService from '@thxnetwork/api/services/RewardService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import ClaimService from '@thxnetwork/api/services/ClaimService';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    /*
    #swagger.tags = ['Claims']
    #swagger.responses[200] = {
        description: 'Get a reward claim',
        schema: { $ref: '#/definitions/Claim' }
    }
    */
    const claim = await ClaimService.findById(req.params.id);
    if (!claim) throw new NotFoundError('Could not find this claim');

    const pool = await AssetPoolService.getById(claim.poolId);
    if (!pool) throw new NotFoundError('Could not find this pool');

    const reward = await RewardService.get(pool, claim.rewardId);
    if (!reward) throw new NotFoundError('Could not find this reward');

    let tokenSymbol;
    if (claim.erc20Id) {
        const erc20 = await ERC20Service.getById(claim.erc20Id);
        tokenSymbol = erc20.symbol;
    } else if (claim.erc721Id) {
        const erc721 = await ERC721Service.findById(claim.erc721Id);
        tokenSymbol = erc721.symbol;
    }

    res.json({
        _id: claim._id,
        poolId: claim.poolId,
        erc20Id: claim.erc20Id,
        erc721Id: claim.erc721Id,
        rewardId: claim.rewardId,
        withdrawAmount: reward.withdrawAmount,
        withdrawCondition: reward.withdrawCondition,
        chainId: pool.chainId,
        clientId: pool.clientId,
        poolAddress: pool.address,
        tokenSymbol,
    });
};

export default { controller, validation };
