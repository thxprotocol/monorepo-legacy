import mongoose from 'mongoose';
import { TInviteUsed } from '../types/TInviteUsed';

export type InviteUsedDocument = mongoose.Document & TInviteUsed;

const schema = new mongoose.Schema({
    guildId: String,
    inviteId: String,
    inviterId: String,
    url: String,
    userId: String,
});

export default mongoose.model<InviteUsedDocument>('invitesused', schema);
