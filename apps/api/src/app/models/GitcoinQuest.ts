import mongoose from 'mongoose';
import { TGitcoinQuest } from '@thxnetwork/types/interfaces';
import { questBaseSchema } from '@thxnetwork/api/models/ERC20Perk';

export type GitcoinQuestDocument = mongoose.Document & TGitcoinQuest;

const schema = new mongoose.Schema(
    {
        ...questBaseSchema,
        amount: Number,
        scorerId: Number,
        score: Number,
    },
    { timestamps: true },
);
schema.index({ createdAt: 1 });

export const GitcoinQuest = mongoose.model<GitcoinQuestDocument>('GitcoinQuests', schema, 'gitcoinquests');
