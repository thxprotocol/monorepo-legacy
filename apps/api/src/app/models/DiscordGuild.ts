import mongoose from 'mongoose';
import { TDiscordGuild } from '../types/TDiscordGuild';

export type DiscordGuildDocument = mongoose.Document & TDiscordGuild;

const discordGuildSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        guildId: String,
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<DiscordGuildDocument>('DiscordGuild', discordGuildSchema, 'discordguilds');
