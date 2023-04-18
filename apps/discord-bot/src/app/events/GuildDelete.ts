import { Guild as IGuild } from 'discord.js';
import { handleError } from '../commands/error';
import { logger } from '../utils/logger';
import Guild from '../models/Guild';

const onGuildDelete = async (guild: IGuild) => {
    logger.info(`GuildDelete: ${guild.id}`);
    try {
        await Guild.updateOne({ id: guild.id }, { active: false });
    } catch (error) {
        handleError(error);
    }
};

export default onGuildDelete;
