import {
    ActionRowBuilder,
    ButtonInteraction,
    CommandInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { DiscordStringSelectMenuVariant } from '../InteractionCreated';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { questInteractionVariantMap } from '@thxnetwork/common/lib/types/maps';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WalletService from '@thxnetwork/api/services/WalletService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';

async function createSelectMenuQuests(interaction: CommandInteraction | ButtonInteraction) {
    const discordGuilds = await DiscordGuild.find({ guildId: interaction.guild.id });
    if (!discordGuilds) throw new Error('Could not find guild.');

    const poolId = discordGuilds.map((g) => g.poolId);
    const campaigns = await AssetPool.find({ _id: poolId });
    if (!campaigns.length) throw new Error('No campaigns found for this server.');

    const results = await Promise.all([
        DailyReward.find({ poolId, isPublished: true }),
        ReferralReward.find({ poolId, isPublished: true }),
        PointReward.find({ poolId, isPublished: true }),
        MilestoneReward.find({ poolId, isPublished: true }),
        Web3Quest.find({ poolId, isPublished: true }),
    ]);
    const quests = results.flat();
    const select = new StringSelectMenuBuilder();
    select.setCustomId(DiscordStringSelectMenuVariant.QuestComplete).setPlaceholder('Complete a quest');

    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    if (!account) throw new Error('No THX account found for this Discord user.');

    const wallet = await WalletService.findPrimary(account.sub, campaigns[0].chainId);
    if (!wallet) throw new Error('No wallet found for this account.');

    for (const index in quests) {
        const quest: any = quests[index];
        const campaign = campaigns.find((c) => String(c._id) === quest.poolId);
        const questId = String(quest._id);
        const variant = quest.interaction ? questInteractionVariantMap[quest.interaction] : quest.variant;
        const value = JSON.stringify({ questId, variant });
        const amount = await QuestService.getAmount(variant, quest, account, wallet);
        const options = new StringSelectMenuOptionBuilder()
            .setLabel(`[${amount}] ${quest.title}`)
            .setDescription(`${campaign.settings.title}`)
            .setValue(value);

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuQuests };
