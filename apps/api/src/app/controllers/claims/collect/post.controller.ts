import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import { findRewardByUuid, isTERC20Perk, isTERC721Perk } from '@thxnetwork/api/util/rewards';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import { validateCondition } from '@thxnetwork/api/util/condition';
import { ERC20PerkPayment } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ERC721PerkPayment } from '@thxnetwork/api/models/ERC721PerkPayment';
import { canClaim } from '@thxnetwork/api/util/condition';

const validation = [param('uuid').exists().isString(), query('forceSync').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Claims']
    const claim = await ClaimService.findByUuid(req.params.uuid);
    if (!claim) throw new BadRequestError('This claim URL is invalid.');

    const pool = await PoolService.getById(claim.poolId);
    if (!pool) throw new BadRequestError('The pool for this perks has been removed.');

    const account = await AccountProxy.getById(req.auth.sub);
    if (!account.address) throw new BadRequestError('The authenticated account has not accessed its wallet.');

    const reward = await findRewardByUuid(claim.rewardUuid);
    if (!reward) throw new BadRequestError('The reward for this ID does not exist.');

    const { result, error } = await canClaim(reward, account);
    if (!result || error) throw new ForbiddenError(error);

    if (isTERC20Perk(reward) && claim.erc20Id) {
        // Validate the claim
        const { result, error } = await validateCondition(account, reward);
        if (!result || error) return res.json({ error });

        // Can only claim this reward once and a withdrawal already exists
        if (reward.rewardLimit > 0) {
            const amountOfClaims = await ERC20PerkPayment.countDocuments({
                perkId: reward._id,
            });
            if (amountOfClaims >= reward.rewardLimit) {
                throw new ForbiddenError("This reward has reached it's limit");
            }
        }

        if (await ERC20PerkPayment.exists({ perkId: reward._id, sub: req.auth.sub })) {
            throw new ForbiddenError('You can only claim this reward once.');
        }

        let withdrawal: WithdrawalDocument = await WithdrawalService.create(
            pool,
            WithdrawalType.ClaimReward,
            req.auth.sub,
            Number(reward.amount),
            WithdrawalState.Pending,
            null,
            String(reward._id),
        );

        const erc20 = await ERC20Service.getById(claim.erc20Id);
        let withdrawal: WithdrawalDocument = await WithdrawalService.create(erc20, req.auth.sub, Number(reward.amount));
        withdrawal = await WithdrawalService.withdrawFor(pool, withdrawal, account, erc20, false);

        const payment = await ERC20PerkPayment.create({
            sub: req.auth.sub,
            perkId: reward._id,
        });

        return res.json({ withdrawal, erc20, reward: reward, claim, payment });
    }

    if (isTERC721Perk(reward) && claim.erc721Id) {
        // Validate the claim
        const { result, error } = await validateCondition(account, reward);
        if (!result || error) return res.json({ error });

        // Can only claim this reward once and a withdrawal already exists
        if (reward.rewardLimit > 0) {
            const amountOfClaims = await ERC721PerkPayment.countDocuments({
                perkId: reward._id,
            });
            if (amountOfClaims >= reward.rewardLimit) {
                throw new ForbiddenError("This reward has reached it's limit");
            }
        }

        if (await ERC721PerkPayment.exists({ perkId: reward._id, sub: req.auth.sub })) {
            throw new ForbiddenError('You can only claim this reward once.');
        }

        const metadata = await ERC721Service.findMetadataById(reward.erc721metadataId);
        if (!metadata) throw new NotFoundError('No metadata found for reward');
        const erc721 = await ERC721Service.findById(metadata.erc721);
        const token = await ERC721Service.mint(pool, erc721, metadata, account, false);

        const payment = await ERC721PerkPayment.create({
            sub: req.auth.sub,
            perkId: reward._id,
        });

        return res.json({ token, erc721, metadata, reward: reward, claim, payment });
    }
};

export default { controller, validation };
