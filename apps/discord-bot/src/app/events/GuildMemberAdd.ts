import { GuildMember } from 'discord.js';
import { handleError } from '../commands/error';
import InviteUsed from '../models/InviteUsed';

const onGuildMemberAdd = async (member: GuildMember) => {
    try {
        // Get new invite list
        const newInvites = await member.guild.invites.fetch();

        await Promise.all(
            // Map through the new invites
            newInvites.map(async (i) => {
                const uses = await InviteUsed.count({ guildId: member.guild.id, code: i.code });
                // Find where uses went up and update records in local db
                if (i.uses > uses) {
                    // Create an InviteUsed record for all invites that are not yet recorded in the database
                    await InviteUsed.create({
                        guildId: i.guild.id,
                        code: i.code,
                        inviterId: i.inviterId,
                        userId: member.user.id,
                    });
                }
            }),
        );
    } catch (error) {
        handleError(error);
    }
};

export default onGuildMemberAdd;
