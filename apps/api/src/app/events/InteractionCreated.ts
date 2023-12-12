import { ChatInputCommandInteraction, StringSelectMenuInteraction } from 'discord.js';
import { handleError } from './commands/error';
import { handleCampaignConnect, handleQuestComplete } from './handlers/index';
import { logger } from '../util/logger';
import router from './commands';

export enum StringSelectMenuVariant {
    CampaignConnect = 'thx.campaign.connect',
    QuestComplete = 'thx.campaign.quest.complete',
}

const stringSelectMenuMap = {
    [StringSelectMenuVariant.CampaignConnect]: handleCampaignConnect,
    [StringSelectMenuVariant.QuestComplete]: handleQuestComplete,
};

const onInteractionCreated = async (interaction: ChatInputCommandInteraction | StringSelectMenuInteraction) => {
    try {
        if (interaction.isStringSelectMenu()) {
            logger.info(`#${interaction.user.id} picked ${interaction.values[0]} for ${interaction.customId}`);
            await stringSelectMenuMap[interaction.customId](interaction);
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
