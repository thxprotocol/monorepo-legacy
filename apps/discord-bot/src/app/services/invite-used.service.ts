import InviteUsed from '../models/InviteUsed';
import { TInviteUsed } from '../types/TInviteUsed';

export default {
    get: async (_id: string) => {
        return await InviteUsed.findById(_id);
    },
    findOne: async (query: TInviteUsed) => {
        return await InviteUsed.findOne(query);
    },
    list: async (query: TInviteUsed) => {
        return await InviteUsed.find(query);
    },
    create: async (updates: TInviteUsed) => {
        return await InviteUsed.create(updates);
    },
    update: async (_id: string, updates: TInviteUsed) => {
        return await InviteUsed.findOneAndUpdate({ _id }, updates, { new: true });
    },
    delete: async (query: TInviteUsed) => {
        return await InviteUsed.deleteMany(query);
    },
};
