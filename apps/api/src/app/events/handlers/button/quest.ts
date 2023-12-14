import { ButtonInteraction } from 'discord.js';
import { QuestVariant } from '@thxnetwork/common/lib/types/enums';
import { completeQuest } from '@thxnetwork/api/events/handlers/select/quest';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { PointReward } from '@thxnetwork/api/models/PointReward';
import { MilestoneReward } from '@thxnetwork/api/models/MilestoneReward';
import { ReferralReward } from '@thxnetwork/api/models/ReferralReward';
import { Web3Quest } from '@thxnetwork/api/models/Web3Quest';
import { handleError } from '../../commands/error';

export async function onClickQuestComplete(interaction: ButtonInteraction) {
    try {
        // Custom Id Syntax: DiscordButtonVariant.QuestComplete + ':' + questVariant ':' + questId
        const data = interaction.customId.split(':');
        const variant = data[1] as unknown as QuestVariant;
        const questId = data[2];

        await completeQuest(interaction, variant, questId);
    } catch (error) {
        handleError(error, interaction);
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
        const list = quests.map(
            (quest: any) =>
                `${String(quest.amount ? quest.amount : quest.amounts[0]).padStart(4)} pts. | ${quest.title}`,
        );
        const code = list.join('\n');
        const embeds = [
            {
                title: `✅ Quests`,
                description: 'Use `/thx complete` to earn points and buy rewards!🎁 \n ```' + code + `\n` + '```',
            },
        ];
        throw new Error('Foobar');

        interaction.reply({ embeds, ephemeral: true });
    } catch (error) {
        handleError(error, interaction);
    }
}
