import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
} from 'discord.js';
import { thxClient } from '../configs/oidc';
import GuildService from '../services/guild.service';

export default {
    data: new SlashCommandBuilder()
        .setName('pool')
        .setDescription('Connect and manage Pool Interactions')
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('connect')
                .setDescription('Connect a Pool into current guild')
                .addStringOption((option) =>
                    option.setName('pool_id').setDescription('Pool ID to connect with').setRequired(true),
                ),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder().setName('info').setDescription('Show current Guild Infomations'),
        ),
    executor: async (interaction: CommandInteraction) => {
        const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
        if (!isAdmin)
            return interaction.reply({
                content: 'You much be Guild Administrator tobe able to do this',
                ephemeral: true,
            });

        let userConnected;

        try {
            userConnected = await thxClient.account.getByDiscordId(interaction.user.id).catch();
        } catch (e) {
            userConnected = null;
        }

        if (!userConnected)
            return interaction.reply({
                content: 'Please connect your THX Account with Discord first.',
                ephemeral: true,
            });
        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case 'info': {
                const guild = await GuildService.get(interaction.guildId);
                if (!guild)
                    return interaction.reply({
                        content: `There not yet any infomation about this guild`,
                        ephemeral: true,
                    });
                const pool = await thxClient.pools.verifyAccessByDiscordId(interaction.user.id, guild.poolId);

                const embed = new EmbedBuilder()
                    .setTitle('Pool Infomation')
                    .addFields(
                        {
                            name: 'ID',
                            value: pool._id,
                        },
                        { name: 'Address', value: pool.address },
                    )
                    .setTimestamp();
                interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
            case 'connect': {
                const poolId = options.getString('pool_id', true);
                const isVerified = await thxClient.pools.verifyAccessByDiscordId(interaction.user.id, poolId);
                if (!isVerified)
                    return interaction.reply({
                        content: 'Cannot connect current guild into this PoolId',
                        ephemeral: true,
                    });

                await GuildService.connect(interaction.guildId, poolId);
                interaction.reply({ content: `Connected Pool with ID ${poolId} into current Guild`, ephemeral: true });
                break;
            }
        }
    },
};
