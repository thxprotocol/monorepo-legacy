import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { QuestVariant } from '@thxnetwork/common/lib/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import QuestService, { questEntryDataMap } from '@thxnetwork/api/services/QuestService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { handleError } from '../../commands/error';

export async function completeQuest(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    variant: QuestVariant,
    questId: string,
) {
    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    if (!account) throw new Error('Could not find your THX account.');

    const discordGuild = await DiscordGuild.findOne({ guildId: interaction.guild.id });
    if (!discordGuild) throw new Error('Could not find this Discord server.');

    const pool = await PoolService.getById(discordGuild.poolId);
    if (!pool) throw new Error('Could not find this campaign.');

    const wallet = await SafeService.findPrimary(account.sub, pool.chainId);
    if (!wallet) throw new Error('Could not find your wallet.');

    const quest = await QuestService.findById(variant, questId);
    if (!quest) throw new Error('Could not find this quest.');

    const validationResult = await QuestService.validate(variant, quest, account, wallet);
    if (!validationResult.result) throw new Error(validationResult.reason);

    const amount = await QuestService.getAmount(variant, quest, account, wallet);
    if (!amount) throw new Error('Could not figure out how much points you should get.');

    await QuestService.complete(variant, amount, pool, quest, account, wallet, questEntryDataMap[variant](quest));

    interaction.reply({
        content: `Completed **${quest.title}** and earned **${amount} points**.`,
        ephemeral: true,
    });
}

export async function onSelectQuestComplete(interaction: StringSelectMenuInteraction) {
    try {
        const { questId, variant } = JSON.parse(interaction.values[0]);

        await completeQuest(interaction, variant, questId);
    } catch (error) {
        handleError(error, interaction);
    }
}
