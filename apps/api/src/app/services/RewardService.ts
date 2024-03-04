import { Document } from 'mongoose';
import { RewardVariant } from '@thxnetwork/common/enums';
import { PoolDocument, Participant, WalletDocument } from '@thxnetwork/api/models';
import { v4 } from 'uuid';
import { logger } from '../util/logger';
import RewardCoinService from './RewardCoinService';
import LockService from './LockService';
import AccountProxy from '../proxies/AccountProxy';
import ParticipantService from './ParticipantService';
import RewardNFTService from './RewardNFTService';
import RewardCouponService from './RewardCouponService';
import ImageService from './ImageService';
import PointBalanceService from './PointBalanceService';
import MailService from './MailService';
import RewardDiscordRoleService from './RewardDiscordRoleService';
import RewardCustomService from './RewardCustomService';

const serviceMap = {
    [RewardVariant.Coin]: new RewardCoinService(),
    [RewardVariant.NFT]: new RewardNFTService(),
    [RewardVariant.Custom]: new RewardCustomService(),
    [RewardVariant.Coupon]: new RewardCouponService(),
    [RewardVariant.DiscordRole]: new RewardDiscordRoleService(),
};

export default class RewardService {
    static async list({ pool, account }) {
        const rewardVariants = Object.keys(RewardVariant).filter((v) => !isNaN(Number(v)));
        const callback: any = async (variant: RewardVariant) => {
            const Reward = serviceMap[variant].models.reward;
            const rewards = await Reward.find({
                poolId: pool._id,
                variant,
                isPublished: true,
                pointPrice: { $exists: true, $gt: 0 },
                $or: [
                    // Include quests with expiryDate less than or equal to now
                    { expiryDate: { $exists: true, $gte: new Date() } },
                    // Include quests with no expiryDate
                    { expiryDate: { $exists: false } },
                ],
            });

            return await Promise.all(
                rewards.map(async (reward) => {
                    try {
                        const decorated = await serviceMap[reward.variant].decorate({ reward, account });
                        const isLocked = await this.isLocked({ reward, account });
                        const isStocked = await this.isStocked(reward);
                        const isExpired = this.isExpired(reward);
                        const isAvailable = await this.isAvailable({ reward, account });
                        const progress = {
                            count: await serviceMap[reward.variant].models.payment.countDocuments({
                                rewardId: reward._id,
                            }),
                            limit: reward.limit,
                        };

                        // Decorated properties may override generic properties
                        return { progress, isLocked, isStocked, isExpired, isAvailable, ...decorated };
                    } catch (error) {
                        logger.error(error);
                    }
                }),
            );
        };

        return await Promise.all(rewardVariants.map(callback));
    }

    static async findPayments(reward: TReward, { page, limit }: { page: number; limit: number }) {
        const skip = (page - 1) * limit;
        const Payment = serviceMap[reward.variant].models.payment;
        const total = await Payment.countDocuments({ rewardId: reward._id });
        const payments = await Payment.find({ rewardId: reward._id }).limit(limit).skip(skip);
        const accounts = await AccountProxy.find({ subs: payments.map(({ sub }) => sub) });
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

    static async findPaymentsForSub(sub: string) {
        const rewardVariants: string[] = Object.keys(RewardVariant).filter((v) => !isNaN(Number(v)));
        const payments = await Promise.all(
            rewardVariants.map(async (variant: string) => {
                const rewardVariant = Number(variant);
                const payments = await serviceMap[rewardVariant].models.payment.find({ sub });
                const callback = payments.map(async (p: Document & TRewardPayment) => {
                    const decorated = await serviceMap[rewardVariant].decoratePayment(p);
                    return { ...decorated, rewardVariant };
                });
                return await Promise.all(callback);
            }),
        );

        return payments.flat();
    }

    static async createPayment(
        variant: RewardVariant,
        {
            pool,
            reward,
            account,
            safe,
            wallet,
        }: {
            pool: PoolDocument;
            reward: TReward;
            account: TAccount;
            safe?: WalletDocument;
            wallet?: WalletDocument;
        },
    ) {
        // Validate supply, expiry, locked and reward specific validation
        const validationResult = await this.getValidationResult({ reward, account, safe });
        if (!validationResult.result) return validationResult.reason;

        // Subtract points for account
        await PointBalanceService.subtract(pool, account, reward.pointPrice);

        // Send email notification
        let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
        html += `<p>Your payment has been received! <strong>${reward.title}</strong> is available in your account.</p>`;
        html += `<p class="btn"><a href="${pool.campaignURL}">View Wallet</a></p>`;
        await MailService.send(account.email, `🎁 Reward Received!`, html);

        // Register the payment for the account
        return await serviceMap[variant].createPayment({ reward, account, safe, wallet });
    }

    static async create(variant: RewardVariant, poolId: string, data: Partial<TReward>, file?: Express.Multer.File) {
        if (file) {
            data.image = await ImageService.upload(file);
        }

        const reward = await serviceMap[variant].create({ ...data, poolId, variant, uuid: v4() });

        // TODO Implement publish notification flow for rewards
        // if (data.isPublished) {
        //     await NotificationService.notify(variant, quest);
        // }

        return reward;
    }

    static async update(reward: TReward, updates: Partial<TReward>, file?: Express.Multer.File) {
        if (file) {
            updates.image = await ImageService.upload(file);
        }

        reward = await serviceMap[reward.variant].update(reward, updates);

        // TODO Implement publish notification flow for rewards
        // if (data.isPublished) {
        //     await NotificationService.notify(variant, quest);
        // }

        return reward;
    }

    static async remove(reward: TReward) {
        return await serviceMap[reward.variant].remove(reward);
    }

    static findById(variant: RewardVariant, rewardId: string) {
        return serviceMap[variant].findById(rewardId);
    }

    static async getValidationResult({
        reward,
        account,
        safe,
    }: {
        reward: TReward;
        account: TAccount;
        safe: WalletDocument;
    }) {
        const isLocked = await this.isLocked({ reward, account });
        if (isLocked) return { result: false, reason: 'This reward is locked.' };

        const isExpired = this.isExpired(reward);
        if (isExpired) return { result: false, reason: 'This reward claim has expired.' };

        const isStocked = await this.isStocked(reward);
        if (!isStocked) return { result: false, reason: 'This reward is out of stock.' };

        return serviceMap[reward.variant].getValidationResult({ reward, account, safe });
    }

    static async isLocked({ reward, account }) {
        if (!account || !reward.locks.length) return false;
        return await LockService.getIsLocked(reward.locks, account);
    }

    static isExpired(reward: TReward) {
        if (!reward.expiryDate) return false;
        return Date.now() > new Date(reward.expiryDate).getTime();
    }

    static async isStocked(reward) {
        if (!reward.limit) return true;
        // Check if reward has a limit and if limit has been reached
        const amountOfPayments = await serviceMap[reward.variant].models.payment.countDocuments({
            rewardId: reward._id,
        });
        return amountOfPayments < reward.limit;
    }

    static async isAvailable({ reward, account }: { reward: TReward; account?: TAccount }) {
        if (!account) return true;

        const isLocked = await this.isLocked({ reward, account });
        const isStocked = await this.isStocked(reward);
        const isExpired = this.isExpired(reward);

        return !isLocked && !isExpired && isStocked;
    }
}
