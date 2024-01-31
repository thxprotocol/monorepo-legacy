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
import { AssetPool, AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { GitcoinQuest } from '@thxnetwork/api/models/GitcoinQuest';

async function findQuests(campaigns: AssetPoolDocument[]) {
    const poolId = campaigns.map(({ _id }) => String(_id));
    return await Promise.all([
        DailyReward.find({ poolId, isPublished: true }),
        ReferralReward.find({ poolId, isPublished: true }),
        PointReward.find({ poolId, isPublished: true }),
        MilestoneReward.find({ poolId, isPublished: true }),
        Web3Quest.find({ poolId, isPublished: true }),
        GitcoinQuest.find({ poolId, isPublished: true }),
    ]);
}

async function createSelectMenuQuests(interaction: CommandInteraction | ButtonInteraction) {
    const discordGuilds = await DiscordGuild.find({ guildId: interaction.guild.id });
    if (!discordGuilds.length) throw new Error('Could not find server.');

    const poolId = discordGuilds.map((g) => g.poolId);
    const campaigns = await AssetPool.find({ _id: poolId });
    if (!campaigns.length) throw new Error('No campaigns found for this server.');

    const select = new StringSelectMenuBuilder();
    select.setCustomId(DiscordStringSelectMenuVariant.QuestComplete).setPlaceholder('Complete a quest');

    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    if (!account) throw new Error('No THX account found for this Discord user.');

    const wallet = await SafeService.findPrimary(account.sub, campaigns[0].chainId);
    if (!wallet) throw new Error('No wallet found for this account.');

    const quests = (await findQuests(campaigns)).flat();
    if (!quests.length) throw new Error('No quests found for this campaign.');

    for (const index in quests) {
        const quest: any = quests[index];

        // Campaign might be removed
        const campaign = campaigns.find((c) => String(c._id) === quest.poolId);
        if (!campaign) continue;

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
