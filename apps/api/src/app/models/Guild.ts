import mongoose from 'mongoose';
import { TGuild } from '../types/TGuild';

export type GuildDocument = mongoose.Document & TGuild;

const guildSchema = new mongoose.Schema(
    {
        sub: String,
        poolId: String,
        guildId: String,
    },
    {
        timestamps: true,
    },
);

export default mongoose.model<GuildDocument>('Guild', guildSchema);
