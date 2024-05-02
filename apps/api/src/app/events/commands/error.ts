import { ButtonInteraction, CommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';

export const handleError = async (
    error: Error,
    interaction?: ButtonInteraction | CommandInteraction | StringSelectMenuInteraction,
) => {
    logger.info(error);
    try {
        if (interaction && interaction.isRepliable() && error.message) {
            await interaction.reply({
                content: error.message,
                ephemeral: true,
            });
        }
    } catch (error) {
        logger.info(error);
        // If the error reply fails we exit silently but log the cause
    }
};
