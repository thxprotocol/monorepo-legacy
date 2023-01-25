import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    Interaction,
    RepliableInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { COMMAND_QUEUE } from '../queues/commands';
import { thxClient } from '../configs/oidc';

export default {
    data: new SlashCommandBuilder()
        .setName('pool')
        .setDescription('Connect and manage Pool Interactions')
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('connect')
                .setDescription('Connect a Pool into current guild')
                .addStringOption((option) => option.setName('pool_id').setDescription('Pool ID to connect with').setRequired(true)),
        ),
    executor: async (interaction: CommandInteraction) => {
        let userConnected;

        try {
            userConnected = await thxClient.account.getByDiscordId(interaction.user.id).catch();
        } catch (e) {
            userConnected = null;
        }

        if (!userConnected) return interaction.reply('Please connect your THX Account with Discord first.');
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case 'connect': {
                const poolId = options.getString('pool_id', true);
                const isVerified = await thxClient.pools.verifyAccessByDiscordId(interaction.user.id, poolId);
                if (!isVerified) interaction.reply('Cannot connect current guild into this PoolId');
                else interaction.reply(`Connected Pool with ID ${poolId} into current Guild`);
                break;
            }
        }
    },
};
