import mongoose from 'mongoose';

export type QuestWebhookEntryDocument = mongoose.Document & TQuestWebhookEntry;

export const QuestWebhookEntry = mongoose.model<QuestWebhookEntryDocument>(
    'QuestWebhookEntry',
    new mongoose.Schema(
        {
            questId: String,
            poolId: String,
            webhookId: String,
            identityId: String,
            sub: String,
            amount: Number,
        },
        { timestamps: true },
    ),
    'questwebhookentry',
);
