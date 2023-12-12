import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { onSubcommandComplete, onSubcommandConnect } from './thx/index';

export default {
    data: new SlashCommandBuilder()
        .setName('thx')
        .setDescription('Quest engine for gaming communities.')
        .addSubcommand(
            new SlashCommandSubcommandBuilder().setName('connect').setDescription('Connect your server to a campaign.'),
        )
        .addSubcommand(new SlashCommandSubcommandBuilder().setName('complete').setDescription('Complete a quest.')),
    executor: (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver;
        const commandMap = {
            connect: () => onSubcommandConnect(interaction),
            complete: () => onSubcommandComplete(interaction),
        };
        const command = options.getSubcommand();
        if (commandMap[command]) commandMap[command]();
    },
};
