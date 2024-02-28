import { Document, Model } from 'mongoose';
import { RewardVariant } from '@thxnetwork/common/enums';
import {
    QRCodeEntryDocument,
    ERC1155Token,
    ERC1155TokenDocument,
    ERC721Token,
    ERC721TokenDocument,
    PoolDocument,
    RewardCoinPayment,
    RewardNFTDocument,
    RewardNFTPayment,
    RewardCustomPayment,
    RewardCouponPayment,
    RewardDiscordRolePayment,
    ERC721Metadata,
    ERC1155Metadata,
    Participant,
} from '@thxnetwork/api/models';
import ERC1155Service from './ERC1155Service';
import RewardCoinService from './RewardCoinService';
import ERC721Service from './ERC721Service';
import LockService from './LockService';
import { isCouponReward, isCustomReward, isDiscordRoleReward, isTRewardCoin, isTRewardNFT } from '../util/rewards';
import AccountProxy from '../proxies/AccountProxy';
import ParticipantService from './ParticipantService';

const serviceMap = {
    [RewardVariant.Coin]: new RewardCoinService(),
    // [RewardVariant.NFT]: new RewardNFTService(),
    // [RewardVariant.Coupon]: new RewardCouponService(),
    // [RewardVariant.Custom]: new RewardCustomService(),
    // [RewardVariant.DiscordRole]: new RewardDiscordRoleService(),
};

export default class RewardService {
    static async findPayments(
        variant: RewardVariant,
        { reward, page, limit }: { reward: TReward; page: number; limit: number },
    ) {
        const skip = (page - 1) * limit;
        const Payment = serviceMap[variant].models.payment;
        const total = await Payment.countDocuments({ rewardId: reward._id });
        const payments = await Payment.find({ rewardId: reward._id }).limit(limit).skip(skip);
        const subs = payments.map((entry) => entry.sub);
        const accounts = await AccountProxy.find({ subs });
        const participants = await Participant.find({ poolId: reward.poolId });
        const promises = payments.map(async (payment: Document & TRewardPayment) =>
            ParticipantService.decorate(payment, { accounts, participants }),
        );
        const results = await Promise.allSettled(promises);

        return {
            total,
            limit,
            page,
            results: results.filter((result) => result.status === 'fulfilled').map((result: any) => result.value),
        };
    }

    static findById(variant, rewardId) {
        const Reward = serviceMap[variant].models.reward;
        return Reward.findById(rewardId);
    }

    static async getMetadata(perk: RewardNFTDocument, token?: ERC721TokenDocument | ERC1155TokenDocument) {
        const metadataId = perk.metadataId || (token && token.metadataId);
        if (perk.erc721Id) {
            return await ERC721Metadata.findById(metadataId);
        }
        if (perk.erc1155Id) {
            return await ERC1155Metadata.findById(metadataId);
        }
    }

    static async getToken(perk: RewardNFTDocument) {
        if (perk.erc721Id) {
            return await ERC721Token.findById(perk.tokenId);
        }
        if (perk.erc1155Id) {
            return await ERC1155Token.findById(perk.tokenId);
        }
    }

    static async getNFT(perk: RewardNFTDocument) {
        if (perk.erc721Id) {
            return await ERC721Service.findById(perk.erc721Id);
        }
        if (perk.erc1155Id) {
            return await ERC1155Service.findById(perk.erc1155Id);
        }
    }

    static async getProgress(r: TReward, model: any) {
        return {
            count: await model.countDocuments({ rewardId: r._id }),
            limit: r.limit,
        };
    }

    static async getExpiry(r: TReward) {
        return {
            now: Date.now(),
            date: new Date(r.expiryDate).getTime(),
        };
    }

    static getPaymentModel(reward: TReward): Model<any> {
        if (isTRewardCoin(reward)) {
            return RewardCoinPayment;
        }
        if (isTRewardNFT(reward)) {
            return RewardNFTPayment;
        }
        if (isCustomReward(reward)) {
            return RewardCustomPayment;
        }
        if (isCouponReward(reward)) {
            return RewardCouponPayment;
        }
        if (isDiscordRoleReward(reward)) {
            return RewardDiscordRolePayment;
        }
    }

    static async validate({
        reward,
        pool,
        account,
    }: {
        reward: TReward;
        pool?: PoolDocument;
        claim?: QRCodeEntryDocument;
        account?: TAccount;
    }): Promise<{ isError: boolean; errorMessage?: string }> {
        const model = this.getPaymentModel(reward);
        if (!model) return { isError: true, errorMessage: 'Could not determine payment model.' };

        // Is gated and reqeust is made authenticated
        if (account && pool && reward.locks.length) {
            const isPerkLocked = await LockService.getIsLocked(reward.locks, account);
            if (isPerkLocked) {
                return { isError: true, errorMessage: 'This perk has been gated with a token.' };
            }
        }

        // Can be claimed only before the expiry date
        if (reward.expiryDate && new Date(reward.expiryDate).getTime() < Date.now()) {
            return { isError: true, errorMessage: 'This perk claim has expired.' };
        }

        // Can only be claimed for the amount of times per perk specified in the limit
        if (reward.limit > 0) {
            const amountOfPayments = await model.countDocuments({ rewardId: reward._id });
            if (amountOfPayments >= reward.limit) {
                return { isError: true, errorMessage: "This perk has reached it's limit." };
            }
        }

        return { isError: false };
    }
}
