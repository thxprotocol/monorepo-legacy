import mongoose from 'mongoose';
import { WIDGET_URL } from '../config/secrets';

export type PoolDocument = mongoose.Document & TPool;

const schema = new mongoose.Schema(
    {
        sub: String,
        chainId: Number,
        transactions: [String],
        version: String,
        token: String,
        signingSecret: String,
        rank: Number,
        safeAddress: String,
        trialEndsAt: Date,
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
            galachainPrivateKey: String,
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

schema.virtual('campaignURL').get(function (this: PoolDocument) {
    const url = new URL(WIDGET_URL);
    url.pathname = `/c/${this.settings.slug}`;
    return url.toString();
});

export const Pool = mongoose.model<PoolDocument>('Pool', schema, 'pool');
