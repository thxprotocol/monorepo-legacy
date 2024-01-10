import { WalletDocument } from '../models/Wallet';
import { ERC20PerkDocument } from '../models/ERC20Perk';
import { ERC721PerkDocument } from '../models/ERC721Perk';
import { AssetPoolDocument } from '../models/AssetPool';
import { ERC1155Token, ERC1155TokenDocument } from '../models/ERC1155Token';
import { ERC721Token, ERC721TokenDocument } from '../models/ERC721Token';
import WalletService from './WalletService';
import ERC1155Service from './ERC1155Service';
import ERC721Service from './ERC721Service';
import { ClaimDocument } from '../models/Claim';
import { ERC20PerkPayment } from '../models/ERC20PerkPayment';
import { ERC721PerkPayment } from '../models/ERC721PerkPayment';
import { isCouponReward, isCustomReward, isDiscordRoleReward, isTERC20Perk, isTERC721Perk } from '../util/rewards';
import mongoose from 'mongoose';
import { CustomRewardDocument } from '@thxnetwork/api/models/CustomReward';
import { CustomRewardPayment } from '@thxnetwork/api/models/CustomRewardPayment';
import { CouponRewardDocument } from '../models/CouponReward';
import { CouponRewardPayment } from '../models/CouponRewardPayment';
import { DiscordRoleRewardDocument } from '../models/DiscordRoleReward';
import { DiscordRoleRewardPayment } from '../models/DiscordRoleRewardPayment';
import { ERC721Metadata } from '../models/ERC721Metadata';
import { ERC1155Metadata } from '../models/ERC1155Metadata';
import LockService from './LockService';

export type PerkDocument =
    | ERC20PerkDocument
    | ERC721PerkDocument
    | CustomRewardDocument
    | CouponRewardDocument
    | DiscordRoleRewardDocument;

export async function getMetadata(perk: ERC721PerkDocument, token?: ERC721TokenDocument | ERC1155TokenDocument) {
    const metadataId = perk.metadataId || (token && token.metadataId);
    if (perk.erc721Id) {
        return await ERC721Metadata.findById(metadataId);
    }
    if (perk.erc1155Id) {
        return await ERC1155Metadata.findById(metadataId);
    }
}

export async function getToken(perk: ERC721PerkDocument) {
    if (perk.erc721Id) {
        return await ERC721Token.findById(perk.tokenId);
    }
    if (perk.erc1155Id) {
        return await ERC1155Token.findById(perk.tokenId);
    }
}

export async function getNFT(perk: ERC721PerkDocument) {
    if (perk.erc721Id) {
        return await ERC721Service.findById(perk.erc721Id);
    }
    if (perk.erc1155Id) {
        return await ERC1155Service.findById(perk.erc1155Id);
    }
}

export async function getIsLockedForWallet(perk: PerkDocument, wallet: WalletDocument) {
    if (!perk.locks.length || !wallet) return;
    return await LockService.getIsLocked(perk.locks, wallet);
}

export async function getIsLockedForSub(perk: PerkDocument, sub: string, pool: AssetPoolDocument) {
    if (!perk.locks.length) return;
    const wallet = await WalletService.findPrimary(sub, pool.chainId);
    if (!wallet) return true;
    return await LockService.getIsLocked(perk.locks, wallet);
}

async function getProgress(r: PerkDocument, model: any) {
    return {
        count: await model.countDocuments({ perkId: r._id }),
        limit: r.limit,
    };
}

async function getExpiry(r: PerkDocument) {
    return {
        now: Date.now(),
        date: new Date(r.expiryDate).getTime(),
    };
}

export function getPaymentModel(perk: PerkDocument): mongoose.Model<any> {
    if (isTERC20Perk(perk)) {
        return ERC20PerkPayment;
    }
    if (isTERC721Perk(perk)) {
        return ERC721PerkPayment;
    }
    if (isCustomReward(perk)) {
        return CustomRewardPayment;
    }
    if (isCouponReward(perk)) {
        return CouponRewardPayment;
    }
    if (isDiscordRoleReward(perk)) {
        return DiscordRoleRewardPayment;
    }
}

export async function validate({
    perk,
    pool,
    sub,
}: {
    perk: PerkDocument;
    pool?: AssetPoolDocument;
    claim?: ClaimDocument;
    sub?: string;
}): Promise<{ isError: boolean; errorMessage?: string }> {
    const model = getPaymentModel(perk);
    if (!model) return { isError: true, errorMessage: 'Could not determine payment model.' };

    // Is gated and reqeust is made authenticated
    if (sub && pool && perk.locks.length) {
        const isPerkLocked = await getIsLockedForSub(perk, sub, pool);
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
}

export default {
    getIsLockedForWallet,
    getExpiry,
    getProgress,
    getIsLockedForSub,
    getMetadata,
    getToken,
    getNFT,
    validate,
};
