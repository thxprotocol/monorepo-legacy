import { Document } from 'mongoose';
import { RewardVariant } from '@thxnetwork/common/enums';
import { Participant, WalletDocument } from '@thxnetwork/api/models';
import { v4 } from 'uuid';
import { logger } from '../util/logger';
import { Job } from '@hokify/agenda';
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
import RewardGalachainService from './RewardGalachainService';
import PoolService from './PoolService';
import WalletService from './WalletService';
import THXService from './THXService';

const serviceMap = {
    [RewardVariant.Coin]: new RewardCoinService(),
    [RewardVariant.NFT]: new RewardNFTService(),
    [RewardVariant.Custom]: new RewardCustomService(),
    [RewardVariant.Coupon]: new RewardCouponService(),
    [RewardVariant.DiscordRole]: new RewardDiscordRoleService(),
    [RewardVariant.Galachain]: new RewardGalachainService(),
};

export default class RewardService {
    static async count({ poolId }) {
        const variants = Object.keys(RewardVariant).filter((v) => !isNaN(Number(v)));
        const counts = await Promise.all(
            variants.map(async (variant: string) => {
                const Reward = serviceMap[variant].models.reward;
                return await Reward.countDocuments({ poolId, isPublished: true });
            }),
        );
        return counts.reduce((acc, count) => acc + count, 0);
    }

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

    static async findPaymentsBySub(
        reward: TReward,
        { skip, limit, query }: { skip: number; limit: number; query: string },
    ) {
        const Payment = serviceMap[reward.variant].models.payment;
        // Get all matching accounts by email and username first
        const accounts = await AccountProxy.find({ query });
        // We then fetch the payments for the list of subs
        const subs = accounts.map(({ sub }) => sub);
        // Then we fetch the participants for the poolId and the list of subs
        const participants = await Participant.find({ poolId: reward.poolId, sub: { $in: subs } });
        const payments = await Payment.find({ rewardId: reward._id, sub: { $in: subs } })
            .limit(limit)
            .skip(skip);

        return { payments, accounts, participants };
    }

    static async findPaymentsByReward(
        reward: TReward,
        { skip, limit }: { skip: number; limit: number; query: string },
    ) {
        const Payment = serviceMap[reward.variant].models.payment;
        // If there is no query we fetch the payments for the reward
        const payments = await Payment.find({ rewardId: reward._id }).limit(limit).skip(skip);
        const subs = payments.map(({ sub }) => sub);
        const accounts = await AccountProxy.find({ subs });
        const participants = await Participant.find({ poolId: reward.poolId, sub: { $in: subs } });

        return { payments, accounts, participants };
    }

    static async findPayments(reward: TReward, { page, limit, query }: { page: number; limit: number; query: string }) {
        const skip = (page - 1) * limit;
        const Payment = serviceMap[reward.variant].models.payment;
        const total = await Payment.countDocuments({ rewardId: reward._id });

        // If there is a query we fetch accounts by username first
        const { payments, accounts, participants } =
            query.length > 3
                ? await this.findPaymentsBySub(reward, { skip, limit, query })
                : await this.findPaymentsByReward(reward, { skip, limit, query });
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
        const payments = await Promise.allSettled(
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

        return payments
            .filter((result) => result.status === 'fulfilled')
            .map((result: any) => result.value)
            .flat();
    }

    static async createPaymentJob(job: Job) {
        try {
            const { variant, sub, rewardId, walletId } = job.attrs.data as any;
            const account = await AccountProxy.findById(sub);
            const reward = await this.findById(variant, rewardId);
            const pool = await PoolService.getById(reward.poolId);
            const wallet = walletId && (await WalletService.findById(walletId));

            // Validate supply, expiry, locked and reward specific validation
            const validationResult = await this.getValidationResult({ reward, account, safe: pool.safe });
            if (!validationResult.result) return validationResult.reason;

            // Subtract points for account
            await PointBalanceService.subtract(pool, account, reward.pointPrice);

            // Send email notification
            let html = `<p style="font-size: 18px">Congratulations!🚀</p>`;
            html += `<p>Your payment has been received! <strong>${reward.title}</strong> is available in your account.</p>`;
            html += `<p class="btn"><a href="${pool.campaignURL}">View Wallet</a></p>`;
            await MailService.send(account.email, `🎁 Reward Received!`, html);

            const payment = await serviceMap[variant].createPayment({ reward, account, safe: pool.safe, wallet });

            // Register THX onboarding campaign event
            await THXService.createEvent(account, 'reward_payment_created');

            // Register the payment for the account
            return payment;
        } catch (error) {
            console.log(error);
            logger.error(error);
        }
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
        const participant = await Participant.findOne({ sub: account.sub, poolId: reward.poolId });
        if (Number(participant.balance) < Number(reward.pointPrice)) {
            return { result: false, reason: 'Participant has insufficient points.' };
        }

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
