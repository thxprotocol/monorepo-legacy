import { GuildMember } from 'discord.js';
import { handleError } from '../commands/error';
import InviteUsed from '../models/InviteUsed';
import Invite from '../models/Invite';
import { logger } from '../utils/logger';

const onGuildMemberAdd = async (member: GuildMember) => {
    logger.info(`GuildMemberAdd: ${member.id}`);
    try {
        const knownInvites = await Invite.find({ guildId: member.guild.id });
        const invites = await member.guild.invites.fetch();

        await Promise.all(
            // Iterate over the new invites
            invites.map(async (i) => {
                const invite =
                    // Check if invite exists in database
                    knownInvites.find((invite) => invite.code === i.code) ||
                    // Alternatively create an invite in database
                    (await Invite.create({
                        guildId: i.guild.id,
                        code: i.code,
                        inviterId: i.inviterId,
                        uses: 0,
                    }));

                // Find where uses went up and update records in local db
                if (i.uses > invite.uses) {
                    // Create an InviteUsed record for all invites that are not yet recorded in the database
                    await InviteUsed.findOneAndUpdate(
                        { userId: member.user.id },
                        { inviteId: invite._id, guildId: i.guild.id, userId: member.user.id },
                        { upsert: true },
                    );
                }
                await invite.updateOne({ uses: i.uses });
            }),
        );
    } catch (error) {
        handleError(error);
    }
};

export default onGuildMemberAdd;
