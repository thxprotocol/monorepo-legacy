import GatewayEvent from '../models/GatewayEvent';
import { TGatewayEvent, TGatewayEventUpdates } from '../types/TGatewayEvent';

export default {
    get: async (_id: string) => {
        return await GatewayEvent.findById(_id);
    },
    list: async (query: TGatewayEventUpdates) => {
        return await GatewayEvent.find(query);
    },
    create: async (updates: TGatewayEvent) => {
        return await GatewayEvent.create(updates);
    },
    update: async (_id: string, updates: TGatewayEventUpdates) => {
        return await GatewayEvent.findOneAndUpdate({ _id }, updates, { new: true });
    },
    delete: async (_id: string) => {
        return await GatewayEvent.deleteOne({ _id });
    },
};
