import {
    ActionRowBuilder,
    ButtonInteraction,
    CommandInteraction,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';
import { DiscordStringSelectMenuVariant } from '../InteractionCreated';
import { QuestInvite } from '@thxnetwork/api/models/QuestInvite';
import { QuestWeb3 } from '@thxnetwork/api/models/QuestWeb3';
import { questInteractionVariantMap } from '@thxnetwork/common/maps';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import {
    DiscordGuild,
    Pool,
    PoolDocument,
    QuestCustom,
    QuestDaily,
    QuestGitcoin,
    QuestSocial,
} from '@thxnetwork/api/models';

async function findQuests(campaigns: PoolDocument[]) {
    const poolId = campaigns.map(({ _id }) => String(_id));
    return await Promise.all([
        QuestDaily.find({ poolId, isPublished: true }),
        QuestInvite.find({ poolId, isPublished: true }),
        QuestSocial.find({ poolId, isPublished: true }),
        QuestCustom.find({ poolId, isPublished: true }),
        QuestWeb3.find({ poolId, isPublished: true }),
        QuestGitcoin.find({ poolId, isPublished: true }),
    ]);
}

async function createSelectMenuQuests(interaction: CommandInteraction | ButtonInteraction) {
    const discordGuilds = await DiscordGuild.find({ guildId: interaction.guild.id });
    if (!discordGuilds.length) throw new Error('Could not find server.');

    const poolId = discordGuilds.map((g) => g.poolId);
    const campaigns = await Pool.find({ _id: poolId });
    if (!campaigns.length) throw new Error('No campaigns found for this server.');

    const select = new StringSelectMenuBuilder();
    select.setCustomId(DiscordStringSelectMenuVariant.QuestComplete).setPlaceholder('Complete a quest');

    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    if (!account) throw new Error('No THX account found for this Discord user.');

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
        const amount = await QuestService.getAmount(variant, quest, account);
        const options = new StringSelectMenuOptionBuilder()
            .setLabel(`[${amount}] ${quest.title}`)
            .setDescription(`${campaign.settings.title}`)
            .setValue(value);

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuQuests };
