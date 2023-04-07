import InviteUsedService from '../../services/invite-used.service';

export const resolvers = {
    Query: {
        invitesUsed: async (root, { guildId, inviterId, url }) => {
            return await InviteUsedService.list({ guildId, url, inviterId });
        },
    },
};
