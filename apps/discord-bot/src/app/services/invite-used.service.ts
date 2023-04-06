import InviteUsed from '../models/invite-used';
import { TInviteUsed, TInviteUsedUpdates } from '../types/TInviteUsed';

export default {
    get: async (_id: string) => {
        return await InviteUsed.findById(_id);
    },
    findOne: async (query: TInviteUsedUpdates) => {
        return await InviteUsed.findOne(query);
    },
    list: async (query: TInviteUsedUpdates) => {
        return await InviteUsed.find(query);
    },
    create: async (updates: TInviteUsed) => {
        return await InviteUsed.create(updates);
    },
    update: async (_id: string, updates: TInviteUsedUpdates) => {
        return await InviteUsed.findOneAndUpdate({ _id }, updates, { new: true });
    },
    delete: async (query: TInviteUsedUpdates) => {
        return await InviteUsed.deleteMany(query);
    },
};
