import { CommandInteraction } from 'discord.js';

export const onSubcommandError = async (interaction: CommandInteraction, error: Error) => {
    console.log(error.message, error);
    await interaction.reply({ content: 'An error occured.', ephemeral: true });
};
