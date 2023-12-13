import mongoose from 'mongoose';
import { TDiscordGuild } from '@thxnetwork/types/interfaces';

export type DiscordGuildDocument = mongoose.Document & TDiscordGuild;

const discordGuildSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        guildId: String,
        channelId: String,
        adminRoleId: String,
        name: String,
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<DiscordGuildDocument>('DiscordGuild', discordGuildSchema, 'discordguilds');
