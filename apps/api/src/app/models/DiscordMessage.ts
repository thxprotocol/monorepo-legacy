import mongoose from 'mongoose';
import { TDiscordMessage } from '../types/TDiscordMessage';

export type DiscordMessageDocument = mongoose.Document & TDiscordMessage;

const discordMessageSchema = new mongoose.Schema(
    {
        guildId: String,
        memberId: String,
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<DiscordMessageDocument>('DiscordMessage', discordMessageSchema, 'discordmessages');
