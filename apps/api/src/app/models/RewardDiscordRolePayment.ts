import mongoose from 'mongoose';
import { rewardPaymentSchema } from './Reward';

export type RewardDiscordRolePaymentDocument = mongoose.Document & TRewardDiscordRolePayment;

const schema = new mongoose.Schema(
    {
        ...rewardPaymentSchema,
        discordRoleId: String,
    },
    { timestamps: true },
);

export const RewardDiscordRolePayment = mongoose.model<RewardDiscordRolePaymentDocument>(
    'discordrolerewardpayments',
    schema,
);
