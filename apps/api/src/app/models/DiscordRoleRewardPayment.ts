import mongoose from 'mongoose';
import { TDiscordRoleRewardPayment } from '@thxnetwork/types/interfaces';

export type DiscordRoleRewardPaymentDocument = mongoose.Document & TDiscordRoleRewardPayment;

const schema = new mongoose.Schema(
    {
        perkId: String,
        sub: String,
        discordRoleId: String,
        poolId: String,
        amount: Number,
    },
    { timestamps: true },
);

export const DiscordRoleRewardPayment = mongoose.model<DiscordRoleRewardPaymentDocument>(
    'discordrolerewardpayments',
    schema,
);
