import Invite from '../models/Invite';
import { TInvite, TInviteUpdates } from '../types/TInvite';

export default {
    get: async (_id: string) => {
        return await Invite.findById(_id);
    },
    findOne: async (query: TInviteUpdates) => {
        return await Invite.findOne(query);
    },
    list: async (query: TInviteUpdates) => {
        return await Invite.find(query);
    },
    create: async (updates: TInvite) => {
        return await Invite.create(updates);
    },
    update: async (_id: string, updates: TInviteUpdates) => {
        return await Invite.findOneAndUpdate({ _id }, updates, { new: true });
    },
    delete: async (query: TInviteUpdates) => {
        return await Invite.deleteMany(query);
    },
};
