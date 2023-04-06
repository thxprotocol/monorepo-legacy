import mongoose from 'mongoose';
import { TGatewayEvent } from '../types/TGatewayEvent';

export type GatewayEventDocument = mongoose.Document & TGatewayEvent;

const schema = new mongoose.Schema(
    {
        guildId: String,
        name: String,
        event: String,
    },
    { timestamps: true },
);

export default mongoose.model<GatewayEventDocument>('gatewayevents', schema);
