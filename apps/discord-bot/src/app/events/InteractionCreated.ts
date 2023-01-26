import { ChatInputCommandInteraction } from 'discord.js';
import router from '../commands';
import { logger } from '../utils/logger';

const onInteractionCreated = (interaction: ChatInputCommandInteraction) => {
    try { // This try catch block might not effect with error that comes from SDK
        logger.info('User:' + interaction.user.id + 'ran' + interaction.commandName + 'command');
        router[interaction.commandName].executor(interaction);
    } catch (e) {
        logger.error(e);
    }
};

export default onInteractionCreated;
