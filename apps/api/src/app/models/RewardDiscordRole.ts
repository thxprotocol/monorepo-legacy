import mongoose from 'mongoose';
import { questSchema } from './Quest';
import { RewardVariant } from '@thxnetwork/common/enums';

export type RewardDiscordRoleDocument = mongoose.Document & TRewardDiscordRole;

const schema = new mongoose.Schema(
    {
        ...questSchema,
        variant: { type: Number, default: RewardVariant.DiscordRole },
        discordRoleId: String,
    },
    { timestamps: true },
);

export const RewardDiscordRole = mongoose.model<RewardDiscordRoleDocument>('discordrolerewards', schema);
