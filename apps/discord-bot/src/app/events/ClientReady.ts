import { Client } from 'discord.js';
import commands from '../commands';
import commandRegister from '../utils/commandRegister';
import Guild from '../models/Guild';
import { logger } from '../utils/logger';
import { handleError } from '../commands/error';
import { TGuild } from '../types/TGuild';
import Invite from '../models/Invite';

const onClientReady = async (client: Client<true>) => {
    logger.info(`Ready! Logged in as ${client.user.tag}`);

    async function invitesIterator(i) {
        return Invite.findOneAndUpdate(
            { code: i.code },
            { guildId: i.guild.id, code: i.code, inviterId: i.inviterId, uses: i.uses },
        );
    }

    async function guildsIterator({ id }: TGuild) {
        const guild = client.guilds.cache.get(id);
        const invites = await guild.invites.fetch();
        await Promise.all(invites.map(invitesIterator));

        return guild;
    }

    try {
        // Register bot command listener
        await commandRegister(Object.values(commands) as any);

        // Iteratore over all guilds and sync invite data with db
        const guilds = await Guild.find({ active: true });
        await Promise.all(guilds.map(guildsIterator));
    } catch (error) {
        handleError(error);
    }
};

export default onClientReady;
