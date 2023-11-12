import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { onSubcommandMe } from './thx/index';

export default {
    data: new SlashCommandBuilder()
        .setName('thx')
        .setDescription('Quest engine for gaming communities.')
        .addSubcommand(
            new SlashCommandSubcommandBuilder().setName('me').setDescription('Your point balance for this pool.'),
        ),
    executor: (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver;
        const commandMap = {
            me: () => onSubcommandMe(interaction),
        };
        const command = options.getSubcommand();
        if (commandMap[command]) commandMap[command]();
    },
};
