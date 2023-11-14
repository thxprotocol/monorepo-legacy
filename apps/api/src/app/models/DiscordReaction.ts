import mongoose from 'mongoose';
import { TDiscordReaction } from '@thxnetwork/types/interfaces';

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

export default mongoose.model<DiscordReactionDocument>('DiscordReaction', discordReactionSchema, 'discordreactions');
