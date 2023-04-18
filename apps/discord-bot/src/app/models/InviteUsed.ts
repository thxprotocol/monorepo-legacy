import mongoose from 'mongoose';
import { TInviteUsed } from '../types/TInviteUsed';

export type InviteUsedDocument = mongoose.Document & TInviteUsed;

const schema = new mongoose.Schema(
    {
        guildId: String,
        inviteId: String,
        userId: String,
    },
    { timestamps: true },
);

export default mongoose.model<InviteUsedDocument>('invitesused', schema);
