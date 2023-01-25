import { RepliableInteraction, SlashCommandBuilder } from 'discord.js';
import { COMMAND_QUEUE } from '../queues/commands';

export default {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Reply with a Pong.'),
    executor: (interaction: RepliableInteraction) => {
        COMMAND_QUEUE.push(() => {
            interaction.reply({ content: '`Pong!`', ephemeral: true });
        });
    },
};
