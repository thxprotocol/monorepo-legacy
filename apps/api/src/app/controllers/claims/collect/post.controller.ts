import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, ForbiddenError } from '@thxnetwork/api/util/errors';
import { WithdrawalState, WithdrawalType } from '@thxnetwork/api/types/enums';
import { WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import MembershipService from '@thxnetwork/api/services/MembershipService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import { Claim } from '@thxnetwork/api/models/Claim';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import RewardBaseService from '@thxnetwork/api/services/RewardBaseService';
import { RewardVariant } from '@thxnetwork/api/types/enums/RewardVariant';
import { RewardTokenDocument } from '../../../models/RewardToken';
import { RewardNftDocument } from '@thxnetwork/api/models/RewardNft';

const validation = [param('id').exists().isString(), query('forceSync').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Rewards']
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

    const reward = await RewardBaseService.get(pool, claim.rewardId);
    if (!reward) throw new BadRequestError('The reward for this ID does not exist.');

    const { result, error } = await RewardBaseService.canClaim(pool, reward, account);

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

    if (reward.variant === RewardVariant.RewardToken && claim.erc20Id) {
        const rewardToken = (await reward.getReward()) as RewardTokenDocument;

        let w: WithdrawalDocument = await WithdrawalService.schedule(
            pool,
            WithdrawalType.ClaimReward,
            req.auth.sub,
            rewardToken.amount,
            WithdrawalState.Pending,
            reward.id,
        );

        const erc20 = await ERC20Service.getById(claim.erc20Id);

        w = await WithdrawalService.withdrawFor(pool, w, account, forceSync);

        return res.json({ ...w.toJSON(), erc20 });
    }

    if (reward.variant === RewardVariant.RewardNFT && claim.erc721Id) {
        const rewardNft = (await reward.getReward()) as RewardNftDocument;

        const metadata = await ERC721Service.findMetadataById(rewardNft.erc721metadataId);
        const erc721 = await ERC721Service.findById(metadata.erc721);
        const token = await ERC721Service.mint(pool, erc721, metadata, account, forceSync);
        return res.json({ ...token.toJSON(), erc721: erc721.toJSON(), metadata: metadata.toJSON() });
    }

    throw new BadRequestError('Invalid Reward Type');
};

export default { controller, validation };
