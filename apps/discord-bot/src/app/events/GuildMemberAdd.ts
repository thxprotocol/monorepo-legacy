import { GuildMember } from 'discord.js';
import { handleError } from '../commands/error';
import InviteService from '../services/invite.service';

const onGuildMemberAdd = async (member: GuildMember) => {
    try {
        console.log('MEMBER ADDED!-----------------------------------------------');
        const invites = await InviteService.list({ guildId: member.guild.id });
        console.log('INVITES', invites);
        if (!invites.length) {
            return;
        }
    } catch (error) {
        handleError(error);
    }
};

export default onGuildMemberAdd;
