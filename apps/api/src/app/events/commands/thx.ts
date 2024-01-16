import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import {
    DiscordCommandVariant,
    onSubcommandBuy,
    onSubcommandComplete,
    onSubcommandInfo,
    onSubcommandPoints,
} from './thx/index';

export const commands: any[] = [
    new SlashCommandBuilder()
        .setName('info')
        .setDescription('View your rank, quests and rewards in this campaign.')
        .addStringOption((option) =>
            option.setName('campaign').setDescription('Campaign to search for').setAutocomplete(true),
        ),
    new SlashCommandBuilder().setName('quest').setDescription('Complete a quest and earn points.'),
    new SlashCommandBuilder().setName('buy').setDescription('Buy a reward with points.'),
    new SlashCommandBuilder()
        .setName('remove-points')
        .setDescription('Remove an amount of points for a user.')
        .addUserOption((option) =>
            option.setName('user').setDescription('The user to transfer points to').setRequired(true),
        )
        .addIntegerOption((option) =>
            option.setName('amount').setDescription('The amount of points to transfer').setRequired(true),
        )
        .addStringOption((option) =>
            option.setName('campaign').setDescription('Campaign to search for').setAutocomplete(true),
        )
        .addStringOption((option) =>
            option.setName('secret').setDescription('The optional secret for increased security'),
        ),
    new SlashCommandBuilder()
        .setName('give-points')
        .setDescription('Give an amount of points to a user.')
        .addUserOption((option) =>
            option.setName('user').setDescription('The user to transfer points to').setRequired(true),
        )
        .addIntegerOption((option) =>
            option.setName('amount').setDescription('The amount of points to transfer').setRequired(true),
        )
        .addStringOption((option) =>
            option.setName('campaign').setDescription('Campaign to search for').setAutocomplete(true),
        )
        .addStringOption((option) =>
            option.setName('secret').setDescription('The optional secret for increased security'),
        ),
];

export default {
    data: commands,
    executor: (interaction: CommandInteraction) => {
        const commandMap = {
            'quest': () => onSubcommandComplete(interaction),
            'buy': () => onSubcommandBuy(interaction),
            'info': () => onSubcommandInfo(interaction),
            'give-points': () => onSubcommandPoints(interaction, DiscordCommandVariant.GivePoints),
            'remove-points': () => onSubcommandPoints(interaction, DiscordCommandVariant.RemovePoints),
        };
        const command = interaction.commandName;
        if (commandMap[command]) commandMap[command]();
    },
};
