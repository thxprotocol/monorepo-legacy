import mongoose from 'mongoose';
import { TInvite } from '../types/TInvite';

export type InviteDocument = mongoose.Document & TInvite;

const schemaInvite = new mongoose.Schema(
    {
        guildId: String,
        inviterId: String,
        code: String,
    },
    { timestamps: true },
);

export default mongoose.model<InviteDocument>('invites', schemaInvite);
