import { ButtonInteraction } from 'discord.js';
import { QuestVariant } from '@thxnetwork/common/lib/types/enums';
import { completeQuest } from '@thxnetwork/api/events/handlers/select/quest';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';

export async function onClickQuestComplete(interaction: ButtonInteraction) {
    try {
        // Custom Id Syntax: DiscordButtonVariant.QuestComplete + ':' + questVariant ':' + questId
        const data = interaction.customId.split(':');
        const variant = data[1] as unknown as QuestVariant;
        const questId = data[2];

        await completeQuest(interaction, variant, questId);
    } catch (error) {
        interaction.reply({ content: error.message, ephemeral: true });
    }
}

export async function onClickQuestList(interaction: ButtonInteraction) {
    try {
        const discordGuild = await DiscordGuild.findOne({ guildId: interaction.guild.id });
        if (!discordGuild) throw new Error('Could not find this Discord server.');

        const { poolId } = discordGuild;
        const results = await Promise.all([
            DailyReward.find({ poolId, isPublished: true }),
            ReferralReward.find({ poolId, isPublished: true }),
            PointReward.find({ poolId, isPublished: true }),
            MilestoneReward.find({ poolId, isPublished: true }),
            Web3Quest.find({ poolId, isPublished: true }),
        ]);
        const quests = results.flat();
        console.log({ quests });

        const list = quests.map((quest) => quest.title);
        const embeds = [
            {
                title: `Quests`,
                description: '```' + list.join('\n') + `\n` + '```',
            },
        ];

        interaction.reply({ embeds, ephemeral: true });
    } catch (error) {
        interaction.reply({ content: error.message, ephemeral: true });
    }
}
