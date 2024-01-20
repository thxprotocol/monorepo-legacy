import mongoose from 'mongoose';
import { TPool } from '@thxnetwork/types/index';

export type AssetPoolDocument = mongoose.Document & TPool;

const assetPoolSchema = new mongoose.Schema(
    {
        sub: String,
        address: String,
        chainId: Number,
        transactions: [String],
        version: String,
        token: String,
        signingSecret: String,
        rank: Number,
        safeAddress: String,
        settings: {
            title: String,
            slug: String,
            description: String,
            startDate: Date,
            endDate: Date,
            isArchived: Boolean,
            isPublished: { type: Boolean, default: false },
            isWeeklyDigestEnabled: { type: Boolean, default: true },
            isTwitterSyncEnabled: { type: Boolean, default: false },
            discordWebhookUrl: String,
            defaults: {
                discordMessage: String,
                conditionalRewards: {
                    title: String,
                    description: String,
                    amount: Number,
                    hashtag: String,
                    isPublished: { type: Boolean, default: false },
                    locks: { type: [{ questId: String, variant: Number }], default: [] },
                },
            },
            authenticationMethods: [Number],
        },
    },
    { timestamps: true },
);

export const AssetPool = mongoose.model<AssetPoolDocument>('AssetPool', assetPoolSchema);
