import mongoose from 'mongoose';

export type DiscordMessageDocument = mongoose.Document & TDiscordMessage;

export const DiscordMessage = mongoose.model<DiscordMessageDocument>(
    'DiscordMessage',
    new mongoose.Schema(
        {
            guildId: String,
            messageId: String,
            memberId: String,
        },
        {
            timestamps: true,
        },
    ),
    'discordmessage',
);
