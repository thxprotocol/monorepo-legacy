import { ButtonInteraction } from 'discord.js';
import { QuestVariant } from '@thxnetwork/common/enums';
import { completeQuest } from '@thxnetwork/api/events/handlers/select/quest';
import { handleError } from '../../commands/error';
import { createSelectMenuQuests } from '../../components';

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
        const row = await createSelectMenuQuests(interaction);

        interaction.reply({ components: [row as any], ephemeral: true });
    } catch (error) {
        handleError(error, interaction);
    }
}
