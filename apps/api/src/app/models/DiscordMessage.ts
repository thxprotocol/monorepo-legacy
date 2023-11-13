import mongoose from 'mongoose';
import { TDiscordMessage } from '../types/TDiscordMessage';

export type DiscordMessageDocument = mongoose.Document & TDiscordMessage;

const discordMessageSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        guildId: String,
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<DiscordMessageDocument>('DiscordMessage', discordMessageSchema, 'discordmessages');
