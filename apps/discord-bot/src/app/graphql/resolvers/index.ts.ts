import Invite from '@thxnetwork/discord/models/Invite';
import InviteUsed from '@thxnetwork/discord/models/InviteUsed';

export const resolvers = {
    Query: {
        invitesUsed: async (root, { guildId, inviterId }) => {
            const inviterInvitesArray = await Invite.find({ inviterId, guildId });
            return await InviteUsed.find({ inviteId: inviterInvitesArray.map((i) => String(i._id)) });
        },
    },
};
