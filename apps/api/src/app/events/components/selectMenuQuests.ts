import {
    ActionRowBuilder,
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
import { QuestVariant } from '@thxnetwork/common/lib/types/enums';
import { questInteractionVariantMap } from '@thxnetwork/common/lib/types/maps';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import QuestService from '@thxnetwork/api/services/QuestService';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import WalletService from '@thxnetwork/api/services/WalletService';

async function createSelectMenuQuests(interaction: CommandInteraction) {
    const { guild, user } = interaction;
    const { poolId } = await DiscordGuild.findOne({ guildId: guild.id });
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

    const campaign = await AssetPool.findById(poolId);
    if (!campaign) throw new Error('No campaign found for this poolId.');

    const account = await AccountProxy.getByDiscordId(user.id);
    if (!account) throw new Error('No THX account found for this Discord user.');

    const wallet = await WalletService.findPrimary(account.sub, campaign.chainId);
    if (!wallet) throw new Error('No wallet found for this account.');

    for (const index in quests) {
        const quest: any = quests[index];
        const questId = String(quest._id);
        const variant = quest.interaction ? questInteractionVariantMap[quest.interaction] : quest.variant;
        const value = JSON.stringify({ questId, variant });
        const amount = await QuestService.getAmount(variant, quest, account, wallet);
        const options = new StringSelectMenuOptionBuilder()
            .setLabel(quest.title)
            .setDescription(`${amount} points (${QuestVariant[variant]} Quest)`)
            .setValue(value);

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuQuests };
