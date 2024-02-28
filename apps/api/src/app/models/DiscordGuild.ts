import mongoose from 'mongoose';

export type DiscordGuildDocument = mongoose.Document & TDiscordGuild;

export const DiscordGuild = mongoose.model<DiscordGuildDocument>(
    'DiscordGuild',
    new mongoose.Schema(
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
    ),
    'discordguild',
);
