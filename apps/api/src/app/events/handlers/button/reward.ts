import { ButtonInteraction } from 'discord.js';

export async function onClickRewardList(interaction: ButtonInteraction) {
    try {
        interaction.reply({ content: 'Not implemented yet!', ephemeral: true });
    } catch (error) {
        interaction.reply({ content: error.message, ephemeral: true });
    }
}
