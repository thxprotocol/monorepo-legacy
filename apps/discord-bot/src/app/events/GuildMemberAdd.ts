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
                code: memberInvite[1].code,
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
                userId: member.user.id,
                inviteId: invite._id,
                code: invite.code,
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
