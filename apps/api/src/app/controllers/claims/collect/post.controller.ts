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
import { redeemValidation } from '@thxnetwork/api/util/perks';

type PerkDocument = ERC20PerkDocument | ERC721PerkDocument;
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
    let claim = await ClaimService.findByUuid(req.params.uuid);
    if (!claim) throw new BadRequestError('This claim URL is invalid.');

    const account = await AccountProxy.getById(req.auth.sub);

    const pool = await PoolService.getById(claim.poolId);
    if (!pool) throw new BadRequestError('The pool for this perk has been removed.');

    const perk = await findRewardByUuid(claim.rewardUuid);
    if (!perk) throw new BadRequestError('The perk for this id does not exist.');

    const model = getPaymentModel(perk);
    if (!model) throw new BadRequestError('Could not determine payment model for this claim.');

    // // Can be claimed only if point price is 0
    // if ((isTERC20Perk(perk) || isTERC721Perk(perk)) && perk.pointPrice > 0) {
    //     throw new ForbiddenError('This perk should be redeemed with points.');
    // }

    // // Can be claimed only before the expiry date
    // const isExpired = new Date(perk.expiryDate).getTime() < Date.now();
    // if (perk.expiryDate && isExpired) {
    //     throw new ForbiddenError('This perk claim has expired.');
    // }

    // // Can only be claimed for the amount of times per sub specified in the claimLimit
    // const amountOfPaymentsPerSub = await model.countDocuments({ perkId: perk._id, sub: req.auth.sub });
    // if (perk.claimLimit > 0 && amountOfPaymentsPerSub >= perk.claimLimit) {
    //     throw new ForbiddenError('You have claimed this perk for the maximum amount of times.');
    // }

    // // Can only be claimed for the amount of times per perk specified in the rewardLimit
    // if (perk.rewardLimit > 0) {
    //     const amountOfPayments = await model.countDocuments({ perkId: perk._id });
    //     if (amountOfPayments >= perk.rewardLimit) {
    //         throw new ForbiddenError("This perk has reached it's limit.");
    //     }
    // }

    // // Can not be claimed when sub is set for this claim URL and claim amount is greater than 1
    // if (perk.claimAmount > 1 && claim.sub) {
    //     throw new ForbiddenError('This perk has been claimed by someone else.');
    // }
    // Can be claimed only if point price is 0
    if ((isTERC20Perk(perk) || isTERC721Perk(perk)) && perk.pointPrice > 0) {
        throw new ForbiddenError('This perk should be redeemed with points.');
    }

    const redeemValidationResult = await redeemValidation({ perk, sub: req.auth.sub, claim });
    if (redeemValidationResult.isError) {
        throw new ForbiddenError(redeemValidationResult.errorMessage);
    }
    // Can only claim if potential platform conditions passes.
    const failReason = await validateCondition(account, perk);
    if (failReason) {
        throw new ForbiddenError(failReason);
    }

    // Create a pool withdrawal if the erc20 for the claim exists.
    if (isTERC20Perk(perk)) {
        const { amount } = perk as ERC20PerkDocument;

        erc20 = await ERC20Service.getById(claim.erc20Id);
        if (!erc20) throw new NotFoundError('No erc20 found for this perk');
        withdrawal = await WithdrawalService.withdrawFor(pool, erc20, req.auth.sub, account.address, amount, false);

        // Create a payment to register a completed claim.
        payment = await ERC20PerkPayment.create({
            sub: req.auth.sub,
            perkId: perk._id,
            amount: perk.pointPrice,
        });
    }

    // Mint an NFT token if the erc721 and metadata for the claim exists.
    if (isTERC721Perk(perk)) {
        const { erc721metadataId } = perk as ERC721PerkDocument;

        metadata = await ERC721Service.findMetadataById(erc721metadataId);
        if (!metadata) throw new NotFoundError('No metadata found for this perk');

        erc721 = await ERC721Service.findById(metadata.erc721Id);
        if (!metadata) throw new NotFoundError('No erc721 found for this perk');

        token = await ERC721Service.mint(pool, erc721, metadata, account.sub, account.address, false);

        // Create a payment to register a completed claim.
        payment = await ERC721PerkPayment.create({
            sub: req.auth.sub,
            perkId: perk._id,
            amount: perk.pointPrice,
            poolId: pool._id,
        });
    }

    // Mark claim as claimed by setting sub when the claimAmount is fixed ( > 1)
    // Perks with claimAmount == 1 will create a claim with no sub that is reused for multilpe claims
    // PerkPayments are used to limit claims per account.
    if (perk.claimAmount > 1) {
        claim.sub = req.auth.sub;
        claim.claimedAt = new Date();
        claim = await claim.save();
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
