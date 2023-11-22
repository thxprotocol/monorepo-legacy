import { Guild } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';
import { handleError } from './commands/error';
import DiscordGuild from '../models/DiscordGuild';

const onGuildDelete = async (guild: Guild) => {
    try {
        logger.info(`Removed from guild: ${guild.name}`);
        await DiscordGuild.findOneAndRemove({ guildId: guild.id });
    } catch (error) {
        handleError(error);
    }
};

export default onGuildDelete;
