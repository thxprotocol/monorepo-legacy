import { Guild } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';
import { handleError } from './commands/error';

const onGuildCreate = async (guild: Guild) => {
    logger.info(`Added to guild: ${guild.name}`);
    try {
        const member = await guild.members.fetch(guild.ownerId);
        await member.send({
            content: 'THX for the invite!🙏 Make sure to connect your campaign in THX Dashboard.',
        });
    } catch (error) {
        handleError(error);
    }
};

export default onGuildCreate;
