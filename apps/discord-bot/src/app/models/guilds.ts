import mongoose from 'mongoose';
import { TGuild } from '../types/TGuild';

export type GuildDocument = mongoose.Document & TGuild;

const guildSchema = new mongoose.Schema({
    id: String,
    poolId: String,
});

export default mongoose.model<GuildDocument>('Guild', guildSchema);
