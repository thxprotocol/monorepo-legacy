import mongoose from 'mongoose';
import { rewardPaymentSchema } from './Reward';

export type RewardDiscordRolePaymentDocument = mongoose.Document & TRewardDiscordRolePayment;

export const RewardDiscordRolePayment = mongoose.model<RewardDiscordRolePaymentDocument>(
    'RewardDiscordRolePayment',
    new mongoose.Schema(
        {
            ...rewardPaymentSchema,
            discordRoleId: String,
        },
        { timestamps: true },
    ),
    'rewarddiscordrolepayment',
);
