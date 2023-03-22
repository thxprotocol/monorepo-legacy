import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import {
    onSubcommandInfo,
    onSubcommandDisconnect,
    onSubcommandConnect,
    onSubcommandMe,
    onSubcommandLeaderboard,
} from './thx/index';

export default {
    data: new SlashCommandBuilder()
        .setName('thx')
        .setDescription('Crypto loyalty for communities.')
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('connect')
                .setDescription('Connect a pool to a server')
                .addStringOption((option) =>
                    option.setName('pool_id').setDescription('Pool ID for server connection.').setRequired(true),
                )
                .addStringOption((option) =>
                    option
                        .setName('channel_id')
                        .setDescription('Channel ID for reward announcements')
                        .setRequired(true),
                ),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('disconnect')
                .setDescription('Disconnect the connected pool from the server. '),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('info')
                .setDescription('Details for the pool connected to this server. '),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder().setName('me').setDescription('Your point balance for this pool.'),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('leaderboard')
                .setDescription('shows the Pool points leaderboard'),
        ),
    executor: (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver;
        switch (options.getSubcommand()) {
            case 'connect': {
                return onSubcommandConnect(interaction);
            }
            case 'disconnect': {
                return onSubcommandDisconnect(interaction);
            }
            case 'info': {
                return onSubcommandInfo(interaction);
            }
            case 'me': {
                return onSubcommandMe(interaction);
            }
            case 'leaderboard': {
                return onSubcommandLeaderboard(interaction);
            }
        }
    },
};
