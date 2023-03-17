import { ChatInputCommandInteraction } from 'discord.js';
import router from '../commands';
import { logger } from '../utils/logger';
import { handleError } from '../commands/error';

const onInteractionCreated = async (interaction: ChatInputCommandInteraction) => {
    try {
        logger.info(`#${interaction.user.id} ran /${interaction.commandName} ${interaction.options.getSubcommand()}`);
        await router[interaction.commandName].executor(interaction);
    } catch (error) {
        handleError(error, interaction);
    }
};

export default onInteractionCreated;
