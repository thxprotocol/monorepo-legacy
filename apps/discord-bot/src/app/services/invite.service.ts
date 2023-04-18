import { TInvite } from '../types/TInvite';
import Invite from '../models/Invite';

export default {
    get: async (_id: string) => {
        return await Invite.findById(_id);
    },
    findOne: async (query: TInvite) => {
        return await Invite.findOne(query);
    },
    list: async (query: TInvite) => {
        return await Invite.find(query);
    },
    create: async (updates: TInvite) => {
        return await Invite.create(updates);
    },
    update: async (_id: string, updates: TInvite) => {
        return await Invite.findOneAndUpdate({ _id }, updates, { new: true });
    },
    delete: async (query: TInvite) => {
        return await Invite.deleteMany(query);
    },
};
