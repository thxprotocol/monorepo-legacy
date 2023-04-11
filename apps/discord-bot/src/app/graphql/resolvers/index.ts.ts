import { TInviteUsed } from '@thxnetwork/discord/types/TInviteUsed';
import InviteUsedService from '../../services/invite-used.service';

export const resolvers = {
    Query: {
        invitesUsed: async (root, { guildId, inviterId }) => {
            return await InviteUsedService.list({ guildId, inviterId } as TInviteUsed);
        },
    },
};
