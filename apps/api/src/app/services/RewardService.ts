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
import AccountProxy from '../proxies/AccountProxy';
import ParticipantService from './ParticipantService';
import RewardNFTService from './RewardNFTService';
import ImageService from './ImageService';
import NotificationService from './NotificationService';
import { v4 } from 'uuid';

const serviceMap = {
    [RewardVariant.Coin]: new RewardCoinService(),
    [RewardVariant.NFT]: new RewardNFTService(),
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

    static async create(variant: RewardVariant, poolId: string, data: Partial<TReward>, file?: Express.Multer.File) {
        if (file) {
            data.image = await ImageService.upload(file);
        }

        const reward = await serviceMap[variant].models.reward.create({ ...data, poolId, variant, uuid: v4() });

        // TODO Implement publish notification flow for rewards
        // if (data.isPublished) {
        //     await NotificationService.notify(variant, quest);
        // }

        return reward;
    }

    static findById(variant: RewardVariant, rewardId: string) {
        return serviceMap[variant].models.reward.findById(rewardId);
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
        const service = serviceMap[reward.variant];
        const Payment = service.models.payment;

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
            const amountOfPayments = await Payment.countDocuments({ rewardId: reward._id });
            if (amountOfPayments >= reward.limit) {
                return { isError: true, errorMessage: "This perk has reached it's limit." };
            }
        }

        return { isError: false };
    }
}
