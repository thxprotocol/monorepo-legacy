import { CommandInteraction } from 'discord.js';

export const handleError = async (interaction: CommandInteraction, error: Error) => {
    console.log(error);
    await interaction.reply({ content: 'An error occured.', ephemeral: true });
};
