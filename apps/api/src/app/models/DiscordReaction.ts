import mongoose from 'mongoose';

export type DiscordReactionDocument = mongoose.Document & TDiscordReaction;

const discordReactionSchema = new mongoose.Schema(
    {
        guildId: String,
        messageId: String,
        memberId: String,
        content: String,
    },
    {
        timestamps: true,
    },
);

export const DiscordReaction = mongoose.model<DiscordReactionDocument>(
    'DiscordReaction',
    discordReactionSchema,
    'discordreactions',
);
