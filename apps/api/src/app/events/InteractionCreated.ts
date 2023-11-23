import { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { handleError } from './commands/error';
import { handleCampaignConnect } from './handlers/index';
import { logger } from '../util/logger';
import router from './commands';

export enum StringSelectMenuVariant {
    CampaignConnect = 'thx.campaign.connect',
}

const onInteractionCreated = async (interaction: ChatInputCommandInteraction | StringSelectMenuInteraction) => {
    try {
        if (interaction.isStringSelectMenu()) {
            logger.info(`#${interaction.user.id} picked ${interaction.values[0]} for ${interaction.customId}`);
            switch (interaction.customId) {
                case StringSelectMenuVariant.CampaignConnect: {
                    handleCampaignConnect(interaction);
                }
            }
        }

        if (interaction.isCommand()) {
            logger.info(
                `#${interaction.user.id} ran /${interaction.commandName} ${interaction.options.getSubcommand()}`,
            );
            await router[interaction.commandName].executor(interaction);
        }
    } catch (error) {
        handleError(error, interaction);
    }
};

export default onInteractionCreated;
