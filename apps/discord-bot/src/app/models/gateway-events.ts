import mongoose from 'mongoose';
import { TGatewayEvent } from '../types/TGatewayEvent';

export type GatewayEventDocument = mongoose.Document & TGatewayEvent;

const schema = new mongoose.Schema({
    guildId: String,
    name: String,
    event: String,
});

export default mongoose.model<GatewayEventDocument>('gatewayevents', schema);
