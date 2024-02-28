import mongoose from 'mongoose';

export type DiscordReactionDocument = mongoose.Document & TDiscordReaction;

export const DiscordReaction = mongoose.model<DiscordReactionDocument>(
    'DiscordReaction',
    new mongoose.Schema(
        {
            guildId: String,
            messageId: String,
            memberId: String,
            content: String,
        },
        {
            timestamps: true,
        },
    ),
    'discordreaction',
);
