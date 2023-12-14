import { ButtonInteraction, StringSelectMenuInteraction } from 'discord.js';
import { DailyRewardClaimState, QuestVariant } from '@thxnetwork/common/lib/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import QuestService from '@thxnetwork/api/services/QuestService';
import SafeService from '@thxnetwork/api/services/SafeService';
import DailyRewardClaimService from '@thxnetwork/api/services/DailyRewardClaimService';
import { handleError } from '../../commands/error';

const questEntryDataMap = {
    [QuestVariant.Daily]: (quest) => ({
        dailyRewardId: String(quest._id),
        state: DailyRewardClaimState.Claimed,
    }),
};

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

    // Specific to Daily
    const isClaimable = await DailyRewardClaimService.isClaimable(quest, wallet);
    if (!isClaimable) throw new Error('Not allowed to complete this quest yet.');

    let amount = quest.amount;
    if (quest.variant == QuestVariant.Daily) {
        const claims = await DailyRewardClaimService.findByWallet(quest, wallet);
        const amountIndex =
            claims.length >= quest.amounts.length ? claims.length % quest.amounts.length : claims.length;
        amount = quest.amounts[amountIndex];
    }
    if (!amount) throw new Error('Could not figure out how much points you should get.');
    // End

    const data = questEntryDataMap[variant](quest);
    if (!data) throw new Error(`Sorry, no support for completing this ${QuestVariant[variant]} Quest yet.`);

    await QuestService.complete(variant, amount, pool, quest, account, wallet, data);

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
