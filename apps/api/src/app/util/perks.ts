import mongoose from 'mongoose';
import { ERC20PerkDocument } from '../models/ERC20Perk';
import { ERC20PerkPayment } from '../models/ERC20PerkPayment';
import { ERC721PerkDocument } from '../models/ERC721Perk';
import { ERC721PerkPayment } from '../models/ERC721PerkPayment';
import { ShopifyPerkDocument } from '../models/ShopifyPerk';
import { ShopifyPerkPayment } from '../models/ShopifyPerkPayment';
import { ClaimDocument } from '../types/TClaim';
import { BadRequestError } from './errors';
import { isTERC20Perk, isTERC721Perk, isTShopifyPerk } from './rewards';
import { AssetPoolDocument } from '../models/AssetPool';
import PerkService from '../services/PerkService';

type PerkDocument = ERC20PerkDocument | ERC721PerkDocument | ShopifyPerkDocument;

export function getPaymentModel(perk: PerkDocument): mongoose.Model<any> {
    if (isTERC20Perk(perk)) {
        return ERC20PerkPayment;
    }
    if (isTERC721Perk(perk)) {
        return ERC721PerkPayment;
    }
    if (isTShopifyPerk(perk)) {
        return ShopifyPerkPayment;
    }
}

export const redeemValidation = async ({
    perk,
    pool,
    sub,
}: {
    perk: PerkDocument;
    pool?: AssetPoolDocument;
    claim?: ClaimDocument;
    sub?: string;
}): Promise<{ isError: boolean; errorMessage?: string }> => {
    const model = getPaymentModel(perk);
    if (!model) throw new BadRequestError('Could not determine payment model for this claim.');

    if (sub && pool && perk.tokenGatingContractAddress) {
        const isPerkLocked = await PerkService.getIsLockedForSub(perk, sub, pool);
        if (isPerkLocked) {
            return { isError: true, errorMessage: 'This perk has been gated with a token.' };
        }
    }

    // Can be claimed only before the expiry date
    if (perk.expiryDate && new Date(perk.expiryDate).getTime() < Date.now()) {
        return { isError: true, errorMessage: 'This perk claim has expired.' };
    }

    // Can only be claimed for the amount of times per perk specified in the limit
    if (perk.limit > 0) {
        const amountOfPayments = await model.countDocuments({ perkId: perk._id });
        if (amountOfPayments >= perk.limit) {
            return { isError: true, errorMessage: "This perk has reached it's limit." };
        }
    }

    return { isError: false };
};
