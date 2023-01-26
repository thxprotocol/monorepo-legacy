import { RepliableInteraction, SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder().setName('ping').setDescription('Reply with a Pong.'),
    executor: (interaction: RepliableInteraction) => {
        interaction.reply({ content: '`Pong!`', ephemeral: true });
    },
};
