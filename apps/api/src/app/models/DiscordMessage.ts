import mongoose from 'mongoose';
import { TDiscordMessage } from '@thxnetwork/types/interfaces';

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

export default mongoose.model<DiscordMessageDocument>('DiscordMessage', discordMessageSchema, 'discordmessages');
