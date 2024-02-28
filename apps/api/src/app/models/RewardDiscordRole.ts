import mongoose from 'mongoose';
import { rewardSchema } from './Reward';
import { RewardVariant } from '@thxnetwork/common/enums';

export type RewardDiscordRoleDocument = mongoose.Document & TRewardDiscordRole;

export const RewardDiscordRole = mongoose.model<RewardDiscordRoleDocument>(
    'RewardDiscordRole',
    new mongoose.Schema(
        {
            ...rewardSchema,
            variant: { type: Number, default: RewardVariant.DiscordRole },
            discordRoleId: String,
        },
        { timestamps: true },
    ),
    'rewarddiscordrole',
);
