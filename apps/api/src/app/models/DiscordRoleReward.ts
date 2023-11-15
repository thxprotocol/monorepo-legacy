import mongoose from 'mongoose';
import { perkBaseSchema } from './ERC20Perk';
import { TDiscordRoleReward } from '@thxnetwork/types/interfaces';

export type DiscordRoleRewardDocument = mongoose.Document & TDiscordRoleReward;

const schema = new mongoose.Schema(
    {
        ...perkBaseSchema,
        discordRoleId: String,
    },
    { timestamps: true },
);

export const DiscordRoleReward = mongoose.model<DiscordRoleRewardDocument>('discordrolerewards', schema);
