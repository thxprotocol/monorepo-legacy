import mongoose from 'mongoose';
import { TInvite } from '../types/TInvite';

export type InviteDocument = mongoose.Document & TInvite;

const schema = new mongoose.Schema({
    guildId: String,
    inviterId: String,
    code: String,
    uses: Number,
    url: String,
});

export default mongoose.model<InviteDocument>('invites', schema);
