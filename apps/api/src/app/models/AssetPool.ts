import mongoose from 'mongoose';
import { TPool } from '@thxnetwork/types/index';
import { WIDGET_URL } from '../config/secrets';

export type AssetPoolDocument = mongoose.Document & TPool;

const assetPoolSchema = new mongoose.Schema(
    {
        sub: String,
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

assetPoolSchema.virtual('campaignURL').get(function (this: AssetPoolDocument) {
    const url = new URL(WIDGET_URL);
    url.pathname = `/c/${this.settings.slug}`;
    return url.toString();
});

export const AssetPool = mongoose.model<AssetPoolDocument>('AssetPool', assetPoolSchema);
