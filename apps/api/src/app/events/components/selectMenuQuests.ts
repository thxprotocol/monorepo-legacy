import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Guild } from 'discord.js';
import { DiscordStringSelectMenuVariant } from '../InteractionCreated';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { QuestVariant } from '@thxnetwork/common/lib/types/enums';

async function createSelectMenuQuests(guild: Guild) {
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
        const quest: any = quests[index];
        const questId = String(quest._id);
        const value = JSON.stringify({ questId, variant: quest.variant });
        const options = new StringSelectMenuOptionBuilder()
            .setLabel(quest.title)
            .setDescription(
                `${quest.amount ? quest.amount : quest.amounts[0]} points 
                (${QuestVariant[quest.variant]} Quest)`,
            )
            .setValue(value);

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuQuests };
