import { ChatInputCommandInteraction } from 'discord.js';
import router from '../commands';
import { logger } from '../utils/logger';
import { handleError } from '../commands/error';

const onInteractionCreated = async (interaction: ChatInputCommandInteraction) => {
    try {
        logger.info('User: ' + interaction.user.id + ' ran ' + interaction.commandName + ' command');
        router[interaction.commandName].executor(interaction);
    } catch (error) {
        handleError(interaction, error);
    }
};

export default onInteractionCreated;
