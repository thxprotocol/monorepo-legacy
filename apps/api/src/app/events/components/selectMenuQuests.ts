import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { TAccount } from '@thxnetwork/types/interfaces';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Guild } from 'discord.js';
import { DiscordStringSelectMenuVariant } from '../InteractionCreated';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';

async function createSelectMenuQuests(account: TAccount, guild: Guild) {
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

    for (const index in quests) {
        const quest = quests[index];
        const { title, description } = quest;
        const questId = String(quest._id);
        const value = JSON.stringify({ questId, variant: quest.variant });
        const options = new StringSelectMenuOptionBuilder().setLabel(String(title)).setValue(value);

        if (description) {
            options.setDescription(description);
        }

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuQuests };
