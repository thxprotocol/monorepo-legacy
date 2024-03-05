import {
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
    ButtonInteraction,
    AutocompleteInteraction,
} from 'discord.js';
import { handleError } from './commands/error';
import { onSelectQuestComplete, onClickQuestComplete, onClickRewardList, onClickQuestList } from './handlers/index';
import { logger } from '../util/logger';
import { DiscordGuild } from '@thxnetwork/api/models';
import { Pool, PoolDocument } from '@thxnetwork/api/models';
import router from './commands/thx';

export enum DiscordStringSelectMenuVariant {
    QuestComplete = 'thx.campaign.quest.entry.create',
    RewardBuy = 'thx.campaign.reward.payment.create',
}

export enum DiscordButtonVariant {
    RewardBuy = 'thx.campaign.reward.payment.create',
    QuestComplete = 'thx.campaign.quest.entry.create',
    QuestList = 'thx.campaign.quest.list',
    RewardList = 'thx.campaign.reward.list',
}

const stringSelectMenuMap = {
    [DiscordStringSelectMenuVariant.QuestComplete]: onSelectQuestComplete,
};

export const onAutoComplete = async (interaction: AutocompleteInteraction) => {
    if (!interaction.isAutocomplete()) return;

    const discordGuilds = await DiscordGuild.find({ guildId: interaction.guildId });
    const focusedValue = interaction.options.getFocused();
    const campaigns = await Promise.all(discordGuilds.map(({ poolId }) => Pool.findById(poolId)));
    const choices = campaigns.filter((c) => !!c).map((c: PoolDocument) => `${c.settings.title}`);
    const filtered = choices.filter((choice) => choice.startsWith(focusedValue));

    await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
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
            if (!stringSelectMenuMap[interaction.customId])
                throw new Error('Support for this action is not yet implemented!');
            await stringSelectMenuMap[interaction.customId](interaction);
        }

        if (interaction.isCommand()) {
            logger.info(`#${interaction.user.id} ran /${interaction.commandName}`);
            router.executor(interaction);
        }
    } catch (error) {
        handleError(error, interaction);
    }
};

export default onInteractionCreated;
