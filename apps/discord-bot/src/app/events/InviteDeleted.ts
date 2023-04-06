import { Invite } from 'discord.js';
import { handleError } from '../commands/error';
import InviteService from '../services/invite.service';

const onInviteDeleted = async (invite: Invite) => {
    try {
        await InviteService.delete({ guildId: invite.guild.id, code: invite.code });
    } catch (error) {
        handleError(error);
    }
};

export default onInviteDeleted;
