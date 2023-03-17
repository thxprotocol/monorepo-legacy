import { CommandInteraction } from 'discord.js';
import { logger } from '../utils/logger';

export const handleError = async (error: Error, interaction?: CommandInteraction) => {
    logger.error(error);
    if (interaction) {
        interaction.reply({ content: 'An error occured.', ephemeral: true });
    }
};
