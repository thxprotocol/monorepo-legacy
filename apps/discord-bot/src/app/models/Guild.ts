import mongoose from 'mongoose';
import { TGuild } from '../types/TGuild';

export type GuildDocument = mongoose.Document & TGuild;

const guildSchema = new mongoose.Schema(
    {
        id: String,
        active: Boolean,
        poolId: String,
        channelId: String,
    },
    { timestamps: true },
);

export default mongoose.model<GuildDocument>('Guild', guildSchema);
