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

const validation = [param('uuid').exists().isString(), query('forceSync').optional().isBoolean()];

const controller = async (req: Request, res: Response) => {
    // #swagger.tags = ['Claims']
    const claim = await ClaimService.findByUuid(req.params.uuid);
    if (!claim) throw new BadRequestError('This claim URL is invalid.');

    const pool = await PoolService.getById(claim.poolId);
    if (!pool) throw new BadRequestError('The pool for this perks has been removed.');

    const account = await AccountProxy.getById(req.auth.sub);
    if (!account.address) throw new BadRequestError('The authenticated account has not accessed its wallet.');

    const perk = await findRewardByUuid(claim.rewardUuid);
    if (!perk) throw new BadRequestError('The reward for this ID does not exist.');

    let model;
    if (isTERC20Perk(perk)) {
        model = ERC20PerkPayment;
    }
    if (isTERC721Perk(perk)) {
        model = ERC721PerkPayment;
    }

    if (isTERC20Perk(perk)) {
        // Validate the claim
        const { result, error } = await validateCondition(account, perk);
        if (!result || error) return res.json({ error });

        // Can only claim this reward once and a withdrawal already exists
        if (perk.rewardLimit > 0) {
            const amountOfClaims = await ERC20PerkPayment.countDocuments({
                perkId: perk._id,
            });
            if (amountOfClaims >= perk.rewardLimit) {
                throw new ForbiddenError("This reward has reached it's limit");
            }
        }

        if (await ERC20PerkPayment.exists({ perkId: perk._id, sub: req.auth.sub })) {
            throw new ForbiddenError('You can only claim this reward once.');
        }

        const erc20 = await ERC20Service.getById(claim.erc20Id);
        let withdrawal: WithdrawalDocument = await WithdrawalService.create(erc20, req.auth.sub, Number(perk.amount));
        withdrawal = await WithdrawalService.withdrawFor(pool, withdrawal, account, erc20, false);

        const payment = await ERC20PerkPayment.create({
            sub: req.auth.sub,
            perkId: perk._id,
        });

        return res.json({ withdrawal, erc20, reward: perk, claim, payment });
    }

    if (isTERC721Perk(perk)) {
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

        // Validate the claim
        const { result, error } = await validateCondition(account, reward);
        if (!result || error) return res.json({ error });

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
