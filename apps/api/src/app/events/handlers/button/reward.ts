import { ButtonInteraction } from 'discord.js';
import { handleError } from '../../commands/error';

export async function onClickRewardList(interaction: ButtonInteraction) {
    try {
        interaction.reply({ content: 'Not implemented yet!', ephemeral: true });
    } catch (error) {
        handleError(error, interaction);
    }
}
