import mongoose from 'mongoose';

export type DiscordGuildDocument = mongoose.Document & TDiscordGuild;

const discordGuildSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        guildId: String,
        channelId: String,
        adminRoleId: String,
        name: String,
        secret: String,
    },
    {
        timestamps: true,
    },
);

export const DiscordGuild = mongoose.model<DiscordGuildDocument>('DiscordGuild', discordGuildSchema, 'discordguilds');
