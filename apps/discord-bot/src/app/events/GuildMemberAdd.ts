import { GuildMember } from 'discord.js';
import { handleError } from '../commands/error';
import InviteUsedService from '../services/invite-used.service';
import InviteService from '../services/invite.service';
import { TInviteUsed } from '../types/TInviteUsed';

const onGuildMemberAdd = async (member: GuildMember) => {
    try {
        const memberInvites = await member.guild.invites.fetch();
        const inviteUsedToCreate: TInviteUsed[] = [];
        for (const memberInvite of memberInvites) {
            const inviteUsed = await InviteUsedService.findOne({
                guildId: memberInvite[1].guild.id,
                url: memberInvite[1].url,
                userId: member.user.id,
            });
            if (inviteUsed) {
                continue;
            }
            const invite = await InviteService.findOne({ guildId: member.guild.id, code: memberInvite[1].code });
            if (!invite) {
                continue;
            }
            inviteUsedToCreate.push({
                guildId: invite.guildId,
                inviteId: invite._id,
                url: invite.url,
                inviterId: invite.inviterId,
                userId: member.user.id,
            });
        }
        const promises = inviteUsedToCreate.map(async (invite) => {
            InviteUsedService.create(invite);
        });
        await Promise.all(promises);
    } catch (error) {
        handleError(error);
    }
};

export default onGuildMemberAdd;
