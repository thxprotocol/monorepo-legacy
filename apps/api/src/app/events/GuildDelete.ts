import { Guild } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';
import { handleError } from './commands/error';
import { DiscordGuild } from '@thxnetwork/api/models';

const onGuildDelete = async (guild: Guild) => {
    try {
        logger.info(`Removed campaign references for guild: ${guild.name}`);
        await DiscordGuild.deleteMany({ guildId: guild.id });
    } catch (error) {
        handleError(error);
    }
};

export default onGuildDelete;
