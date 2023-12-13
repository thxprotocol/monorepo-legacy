import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import {
    DiscordCommandVariant,
    onSubcommandComplete,
    onSubcommandInfo,
    onSubcommandConnect,
    onSubcommandPoints,
} from './thx/index';

export default {
    data: new SlashCommandBuilder()
        .setName('thx')
        .setDescription('Quest engine for gaming communities.')
        .addSubcommand(
            new SlashCommandSubcommandBuilder().setName('connect').setDescription('Connect your server to a campaign.'),
        )
        .addSubcommand(new SlashCommandSubcommandBuilder().setName('complete').setDescription('Complete a quest.'))
        .addSubcommand(new SlashCommandSubcommandBuilder().setName('redeem').setDescription('Redeem a reward.'))
        .addSubcommand(new SlashCommandSubcommandBuilder().setName('info').setDescription('Campaign info.'))
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('remove-points')
                .setDescription('Remove an amount of points for a user.')
                .addUserOption((option) =>
                    option.setName('user').setDescription('The user to transfer points to').setRequired(true),
                )
                .addIntegerOption((option) =>
                    option.setName('amount').setDescription('The amount of points to transfer').setRequired(true),
                ),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('give-points')
                .setDescription('Give an amount of points to a user.')
                .addUserOption((option) =>
                    option.setName('user').setDescription('The user to transfer points to').setRequired(true),
                )
                .addIntegerOption((option) =>
                    option.setName('amount').setDescription('The amount of points to transfer').setRequired(true),
                ),
        ),
    executor: (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver;
        const commandMap = {
            'connect': () => onSubcommandConnect(interaction),
            'complete': () => onSubcommandComplete(interaction),
            'info': () => onSubcommandInfo(interaction),
            'give-points': () => onSubcommandPoints(interaction, DiscordCommandVariant.GivePoints),
            'remove-points': () => onSubcommandPoints(interaction, DiscordCommandVariant.RemovePoints),
        };
        const command = options.getSubcommand();
        if (commandMap[command]) commandMap[command]();
    },
};
