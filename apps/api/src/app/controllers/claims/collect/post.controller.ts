import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, ForbiddenError } from '@thxnetwork/api/util/errors';
import { WithdrawalState, WithdrawalType } from '@thxnetwork/api/types/enums';
import { WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import { Claim } from '@thxnetwork/api/models/Claim';

import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import { canClaimReward, findRewardById, isTERC20Reward, isTERC721Reward } from '../../rewards-utils';
import MembershipService from '@thxnetwork/api/services/MembershipService';

const validation = [param('id').exists().isString(), query('forceSync').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Claims']

    let claim = await ClaimService.findById(req.params.id);
    if (!claim) {
        // maintain compatibility with old the claim urls
        claim = await Claim.findById(req.params.id);
    }
    if (!claim) throw new BadRequestError('This claim URL is invalid.');

    const pool = await AssetPoolService.getById(claim.poolId);
    if (!pool) throw new BadRequestError('The pool for this rewards has been removed.');

    const account = await AccountProxy.getById(req.auth.sub);
    if (!account.address) throw new BadRequestError('The authenticated account has not accessed its wallet.');

    const reward = await findRewardById(claim.rewardId);
    if (!reward) throw new BadRequestError('The reward for this ID does not exist.');

    // Validate the claim
    const { result, error } = await canClaimReward(pool, reward, account);
    if (!result && error) throw new ForbiddenError(error);

    const hasMembership = await MembershipService.hasMembership(pool, account.id);
    if (!hasMembership) {
        if (claim.erc20Id) {
            await MembershipService.addERC20Membership(account.id, pool);
        }
        if (claim.erc721Id) {
            await MembershipService.addERC721Membership(account.id, pool);
        }
    }

    // Force sync by default but allow the requester to do async calls.
    const forceSync = req.query.forceSync !== undefined ? req.query.forceSync === 'true' : true;

    if (isTERC20Reward(reward) && claim.erc20Id) {
        let w: WithdrawalDocument = await WithdrawalService.create(
            pool,
            WithdrawalType.ClaimReward,
            req.auth.sub,
            Number(reward.amount),
            WithdrawalState.Pending,
            null,
            String(reward._id),
        );
        const erc20 = await ERC20Service.getById(claim.erc20Id);

        w = await WithdrawalService.withdrawFor(pool, w, account, forceSync);

        await claim.updateOne({ claimed: true });

        return res.json({ ...w.toJSON(), erc20 });
    }

    if (isTERC721Reward(reward) && claim.erc721Id) {
        const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);
        const erc721 = await ERC721Service.findById(metadata.erc721);
        const token = await ERC721Service.mint(pool, erc721, metadata, account, forceSync);

        await claim.updateOne({ claimed: true });

        return res.json({ ...token.toJSON(), erc721: erc721.toJSON(), metadata: metadata.toJSON() });
    }

    throw new BadRequestError('Invalid Reward Type');
};

export default { controller, validation };
