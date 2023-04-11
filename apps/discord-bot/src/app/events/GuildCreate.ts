import { Guild as TGuild } from 'discord.js';
import { handleError } from '../commands/error';
import Guild from '../models/Guild';
import Invite from '../models/Invite';

const onGuildDelete = async (guild: TGuild) => {
    try {
        // Fetch all existing active invites for this guild
        const invites = await guild.invites.fetch();

        // Add guild if not already there
        await Guild.findOneAndUpdate(
            {
                id: guild.id,
            },
            {
                id: guild.id,
            },
            { upsert: true },
        );

        // Update database with all current invites
        await Promise.all(
            invites.map((i) =>
                Invite.findOneAndUpdate(
                    {
                        code: i.code,
                    },
                    {
                        guildId: i.guild.id,
                        inviterId: i.inviterId,
                        code: i.code,
                    },
                    { upsert: true },
                ),
            ),
        );
    } catch (error) {
        handleError(error);
    }
};

export default onGuildDelete;
