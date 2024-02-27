import mongoose from 'mongoose';

export type DiscordMessageDocument = mongoose.Document & TDiscordMessage;

const discordMessageSchema = new mongoose.Schema(
    {
        guildId: String,
        messageId: String,
        memberId: String,
    },
    {
        timestamps: true,
    },
);

export const DiscordMessage = mongoose.model<DiscordMessageDocument>(
    'DiscordMessage',
    discordMessageSchema,
    'discordmessages',
);
