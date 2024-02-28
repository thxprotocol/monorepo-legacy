import mongoose from 'mongoose';
import { questSchema } from '@thxnetwork/api/models/Quest';

export type QuestGitcoinDocument = mongoose.Document & TGitcoinQuest;

export const QuestGitcoin = mongoose.model<QuestGitcoinDocument>(
    'QuestGitcoin',
    new mongoose.Schema(
        {
            ...(questSchema as any),
            amount: Number,
            scorerId: Number,
            score: Number,
        },
        { timestamps: true },
    ),
    'questgitcoin',
);
