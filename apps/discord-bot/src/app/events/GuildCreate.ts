import { Guild as TGuild } from 'discord.js';
import { handleError } from '../commands/error';
import Guild from '../models/Guild';
import Invite from '../models/Invite';
import { logger } from '../utils/logger';

const onGuildCreate = async (guild: TGuild) => {
    try {
        logger.info(`GuildCreate: ${guild.id}`);
        // Add guild and activate if not already there
        await Guild.findOneAndUpdate({ id: guild.id }, { id: guild.id, active: true }, { upsert: true });

        // Fetch all existing active invites for this guild
        const invites = await guild.invites.fetch();

        // Update database with all current invites
        await Promise.all(
            // Upserts latest invite information into database
            invites.map((i) =>
                Invite.findOneAndUpdate(
                    { code: i.code },
                    { guildId: i.guild.id, inviterId: i.inviterId, code: i.code, uses: i.uses },
                    { upsert: true, new: true },
                ),
            ),
        );
    } catch (error) {
        handleError(error);
    }
};

export default onGuildCreate;
