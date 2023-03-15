import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { onSubcommandInfo, onSubcommandDisconnect, onSubcommandConnect, onSubcommandMe } from './thx/index';
import { onSubcommandError } from './error';

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
        ),
    executor: async (interaction: CommandInteraction) => {
        try {
            const options = interaction.options as CommandInteractionOptionResolver;
            switch (options.getSubcommand()) {
                case 'connect': {
                    await onSubcommandConnect(interaction);
                    break;
                }
                case 'disconnect': {
                    await onSubcommandDisconnect(interaction);
                    break;
                }
                case 'info': {
                    await onSubcommandInfo(interaction);
                    break;
                }
                case 'me': {
                    await onSubcommandMe(interaction);
                    break;
                }
            }
        } catch (error) {
            await onSubcommandError(interaction, error);
        }
    },
};
