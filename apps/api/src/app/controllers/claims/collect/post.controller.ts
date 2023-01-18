import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { param, query } from 'express-validator';
import { BadRequestError, ForbiddenError, NotFoundError } from '@thxnetwork/api/util/errors';
import { findRewardByUuid, isTERC20Perk, isTERC721Perk } from '@thxnetwork/api/util/rewards';
import { validateCondition } from '@thxnetwork/api/util/condition';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import ERC20Service from '@thxnetwork/api/services/ERC20Service';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import ClaimService from '@thxnetwork/api/services/ClaimService';
import { ERC20PerkDocument } from '@thxnetwork/api/models/ERC20Perk';
import { ERC20Document } from '@thxnetwork/api/models/ERC20';
import { ERC20PerkPayment, ERC20PerkPaymentDocument } from '@thxnetwork/api/models/ERC20PerkPayment';
import { ERC721PerkDocument } from '@thxnetwork/api/models/ERC721Perk';
import { ERC721Document } from '@thxnetwork/api/models/ERC721';
import { ERC721TokenDocument } from '@thxnetwork/api/models/ERC721Token';
import { ERC721MetadataDocument } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721PerkPayment, ERC721PerkPaymentDocument } from '@thxnetwork/api/models/ERC721PerkPayment';
import { WithdrawalDocument } from '@thxnetwork/api/models/Withdrawal';
import { PointRewardDocument } from '@thxnetwork/api/models/PointReward';

type PerkDocument = ERC20PerkDocument | ERC721PerkDocument | PointRewardDocument;
type PerkPaymentDocument = ERC20PerkPaymentDocument | ERC721PerkPaymentDocument;

const validation = [param('uuid').exists().isString(), query('forceSync').optional().isBoolean()];

function getPaymentModel(perk: PerkDocument): mongoose.Model<any> {
    if (isTERC20Perk(perk)) {
        return ERC20PerkPayment;
    }
    if (isTERC721Perk(perk)) {
        return ERC721PerkPayment;
    }
}

const controller = async (req: Request, res: Response) => {
    let withdrawal: WithdrawalDocument,
        token: ERC721TokenDocument,
        erc20: ERC20Document,
        erc721: ERC721Document,
        metadata: ERC721MetadataDocument,
        payment: PerkPaymentDocument;

    // #swagger.tags = ['Claims']
    const claim = await ClaimService.findByUuid(req.params.uuid);
    if (!claim) throw new BadRequestError('This claim URL is invalid.');

    const pool = await PoolService.getById(claim.poolId);
    if (!pool) throw new BadRequestError('The pool for this perk has been removed.');

    const account = await AccountProxy.getById(req.auth.sub);
    if (!account.address) throw new BadRequestError('This account has no wallet address yet.');

    const perk = await findRewardByUuid(claim.rewardUuid);
    if (!perk) throw new BadRequestError('The perk for this id does not exist.');

    const model = getPaymentModel(perk);

    // Can be claimed only before the expiry date
    if (perk.expiryDate && new Date(perk.expiryDate).getTime() < Date.now()) {
        throw new ForbiddenError('This perk claim has expired.');
    }

    // Can be claimed only once per claim per sub
    if (perk.claimAmount > 1 && claim.sub) {
        const message =
            claim.sub === req.auth.sub
                ? 'You have already claimed this perk.'
                : 'This perk has been claimed by someone else';
        throw new ForbiddenError(message);
    }

    // Can only be claimed for the amount of times specified in the rewardLimit
    if (perk.rewardLimit > 0) {
        const amountOfPayments = await model.countDocuments({ perkId: perk._id });
        if (amountOfPayments >= perk.rewardLimit) {
            throw new ForbiddenError("This perk has reached it's limit");
        }
    }

    // Can only claim this reward once per account.
    const amountOfClaimsForAccount = await model.exists({ perkId: perk._id, sub: req.auth.sub });
    if (amountOfClaimsForAccount) {
        throw new ForbiddenError('You can only claim this perk once.');
    }

    // Can only claim if potential platform conditions pass.
    const failReason = await validateCondition(account, perk);
    if (failReason) throw new ForbiddenError(failReason);

    // Create a pool withdrawal if the erc20 for the claim exists.
    if (isTERC20Perk(perk)) {
        erc20 = await ERC20Service.getById(claim.erc20Id);
        if (!erc20) throw new NotFoundError('No erc20 found for this perk');

        withdrawal = await WithdrawalService.create(erc20, req.auth.sub, Number(perk.amount));
        withdrawal = await WithdrawalService.withdrawFor(pool, withdrawal, account, erc20, false);

        // Create a payment to register a completed claim.
        payment = await ERC20PerkPayment.create({
            sub: req.auth.sub,
            perkId: perk._id,
        });
    }

    // Mint an NFT token if the erc721 and metadata for the claim exists.
    if (isTERC721Perk(perk)) {
        metadata = await ERC721Service.findMetadataById(perk.erc721metadataId);
        if (!metadata) throw new NotFoundError('No metadata found for this perk');

        erc721 = await ERC721Service.findById(metadata.erc721);
        if (!metadata) throw new NotFoundError('No erc721 found for this perk');

        token = await ERC721Service.mint(pool, erc721, metadata, account, false);

        // Create a payment to register a completed claim.
        payment = await ERC721PerkPayment.create({
            sub: req.auth.sub,
            perkId: perk._id,
        });
    }

    // Mark claim is claimed by setting sub when the claimAmount is fixed ( > 1)
    if (perk.claimAmount > 1) {
        claim.sub = req.auth.sub;
        await claim.save();
    }

    return res.json({
        erc20,
        erc721,
        withdrawal,
        claim,
        payment,
        token,
        metadata,
        reward: perk,
    });
};

export default { controller, validation };
