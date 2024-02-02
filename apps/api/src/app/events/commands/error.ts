import { ButtonInteraction, CommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';

export const handleError = async (
    error: Error,
    interaction?: ButtonInteraction | CommandInteraction | StringSelectMenuInteraction,
) => {
    logger.info(error);
    if (interaction && interaction.isRepliable() && error.message) {
        interaction.reply({
            content: error.message,
            ephemeral: true,
        });
    }
};
