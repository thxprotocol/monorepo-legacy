import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { onSubcommandConnect } from './thx/index';

export default {
    data: new SlashCommandBuilder()
        .setName('thx')
        .setDescription('Quest engine for gaming communities.')
        .addSubcommand(
            new SlashCommandSubcommandBuilder().setName('connect').setDescription('Connect your server to a campaign.'),
        ),
    executor: (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver;
        const commandMap = {
            connect: () => onSubcommandConnect(interaction),
        };
        const command = options.getSubcommand();
        if (commandMap[command]) commandMap[command]();
    },
};
