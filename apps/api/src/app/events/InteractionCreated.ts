import { ChatInputCommandInteraction, StringSelectMenuInteraction, ButtonInteraction } from 'discord.js';
import { handleError } from './commands/error';
import {
    onSelectCampaignConnect,
    onSelectQuestComplete,
    onClickQuestComplete,
    onClickRewardList,
    onClickQuestList,
} from './handlers/index';
import { logger } from '../util/logger';
import router from './commands';

export enum DiscordStringSelectMenuVariant {
    CampaignConnect = 'thx.campaign.connect',
    QuestComplete = 'thx.campaign.quest.complete',
}

export enum DiscordButtonVariant {
    QuestComplete = 'thx.campaign.quest.entry.complete',
    QuestList = 'thx.campaign.quest.list',
    RewardList = 'thx.campaign.reward.list',
}

const stringSelectMenuMap = {
    [DiscordStringSelectMenuVariant.CampaignConnect]: onSelectCampaignConnect,
    [DiscordStringSelectMenuVariant.QuestComplete]: onSelectQuestComplete,
};

const onInteractionCreated = async (
    interaction: ButtonInteraction | ChatInputCommandInteraction | StringSelectMenuInteraction,
) => {
    try {
        if (interaction.isButton()) {
            logger.info(`#${interaction.user.id} clicked button #${interaction.customId}`);
            if (interaction.customId.startsWith(DiscordButtonVariant.QuestComplete)) {
                await onClickQuestComplete(interaction);
            }
            if (interaction.customId.startsWith(DiscordButtonVariant.QuestList)) {
                await onClickQuestList(interaction);
            }
            if (interaction.customId.startsWith(DiscordButtonVariant.RewardList)) {
                await onClickRewardList(interaction);
            }
        }

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
