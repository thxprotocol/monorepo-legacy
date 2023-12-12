import { StringSelectMenuInteraction } from 'discord.js';
import { DailyRewardClaimState, QuestVariant } from '@thxnetwork/common/lib/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import QuestService from '@thxnetwork/api/services/QuestService';
import SafeService from '@thxnetwork/api/services/SafeService';
import DailyRewardClaimService from '@thxnetwork/api/services/DailyRewardClaimService';

const questEntryDataMap = {
    [QuestVariant.Daily]: (quest) => ({
        dailyRewardId: quest._id,
        state: DailyRewardClaimState.Claimed,
    }),
};

export async function handleQuestComplete(interaction: StringSelectMenuInteraction) {
    const { guild, user, values } = interaction;
    try {
        const account = await AccountProxy.getByDiscordId(user.id);
        if (!account) throw new Error('Could not find your THX account.');

        const discordGuild = await DiscordGuild.findOne({ guildId: guild.id });
        if (!discordGuild) throw new Error('Could not find this Discord server.');

        const pool = await PoolService.getById(discordGuild.poolId);
        if (!pool) throw new Error('Could not find this campaign.');

        const { questId, variant } = JSON.parse(values[0]);
        const quest = await QuestService.findById(variant, questId);
        if (!quest) throw new Error('Could not find this quest.');

        const wallet = await SafeService.findPrimary(account.sub, pool.chainId);
        if (!wallet) throw new Error('Could not find your wallet.');

        const isClaimable = await DailyRewardClaimService.isClaimable(quest, wallet);
        if (!isClaimable) throw new Error('This reward is not claimable yet.');

        let amount = quest.amount;
        if (!amount) {
            const claims = await DailyRewardClaimService.findByWallet(quest, wallet);
            const amountIndex =
                claims.length >= quest.amounts.length ? claims.length % quest.amounts.length : claims.length;
            amount = quest.amounts[amountIndex];
        }
        if (!amount) throw new Error('Could not figure out how much points you should get.');

        const data = questEntryDataMap[variant];
        if (!data) throw new Error(`Sorry, no support for completing this ${QuestVariant[variant]} Quest yet.`);

        await QuestService.complete(variant, amount, pool, quest, account, wallet, data);

        interaction.reply({
            content: `Completed **${quest.title}** and earned **${amount} points**.`,
            ephemeral: true,
        });
    } catch (error) {
        interaction.reply({ content: error.message, ephemeral: true });
    }
}
