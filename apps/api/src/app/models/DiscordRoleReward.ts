import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { TDiscordRoleReward } from '@thxnetwork/types/interfaces';
import { RewardVariant } from '@thxnetwork/common/lib/types/enums';

export type DiscordRoleRewardDocument = mongoose.Document & TDiscordRoleReward;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        variant: { type: Number, default: RewardVariant.DiscordRole },
        discordRoleId: String,
    },
    { timestamps: true },
);

export const DiscordRoleReward = mongoose.model<DiscordRoleRewardDocument>('discordrolerewards', schema);
