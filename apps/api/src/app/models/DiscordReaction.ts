import mongoose from 'mongoose';
import { TDiscordReaction } from '../types/TDiscordReaction';

export type DiscordReactionDocument = mongoose.Document & TDiscordReaction;

const discordReactionSchema = new mongoose.Schema(
    {
        guildId: String,
        memberId: String,
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<DiscordReactionDocument>('DiscordReaction', discordReactionSchema, 'discordreactions');
