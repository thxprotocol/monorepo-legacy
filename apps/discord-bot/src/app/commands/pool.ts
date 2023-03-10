import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    EmbedBuilder,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    channelLink,
    GuildChannel,
} from 'discord.js';
import { thxClient } from '../configs/oidc';
import GuildService from '../services/guild.service';
import { client } from '../../bootstrap';

export default {
    data: new SlashCommandBuilder()
        .setName('pool')
        .setDescription('Manage loyalty pool')
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
                .setName('info')
                .setDescription('Details for the pool connected to this server. '),
        )
        .addSubcommand(
            new SlashCommandSubcommandBuilder()
                .setName('disconnect')
                .setDescription('Disconnect the connected pool from the server. '),
        ),
    executor: async (interaction: CommandInteraction) => {
        const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
        if (!isAdmin)
            return interaction.reply({
                content: 'You much be Guild Administrator tobe able to do this',
                ephemeral: true,
            });

        const account = await thxClient.account.getByDiscordId(interaction.user.id).catch();
        if (!account)
            return interaction.reply({
                content: 'Please connect your THX Account with Discord first.',
                ephemeral: true,
            });

        const options = interaction.options as CommandInteractionOptionResolver;
        const subcommand = options.getSubcommand();

        switch (subcommand) {
            case 'info': {
                const guild = await GuildService.get(interaction.guildId);
                if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

                const pool = await thxClient.pools.get(guild.poolId);
                if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });
                if (pool.sub !== account._id) {
                    return interaction.reply({
                        content: 'This Discord account is not connected to the account of the pool owner.',
                        ephemeral: true,
                    });
                }

                const embed = new EmbedBuilder()
                    .setTitle('Pool')
                    .addFields(
                        {
                            name: ':gift: Pool ID',
                            value: `[${pool.title}](https://dashboard.thx.network/pool/${pool._id}/dashboard)`,
                        },
                        {
                            name: ':bell: Reward Announcements',
                            value: `[${guild.channelId}](${channelLink(guild.channelId, guild.id)})`,
                        },
                    )
                    .setTimestamp();

                interaction.reply({ embeds: [embed], ephemeral: true });

                break;
            }
            case 'connect': {
                const poolId = options.getString('pool_id', true);
                const channelId = options.getString('channel_id', true);
                const pool = await thxClient.pools.get(poolId);
                if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });
                if (pool.sub !== account._id) {
                    return interaction.reply({
                        content: 'This Discord account is not connected to the account of the pool owner.',
                        ephemeral: true,
                    });
                }

                const guild = await GuildService.get(interaction.guildId);
                if (!guild) {
                    const channel: any = client.channels.cache.get(channelId);
                    channel.send(
                        "Hi!:wave: I'm THX Bot, keep an eye on this channel to earn points that you can redeem for coins and NFT's:gift:",
                    );
                }

                await GuildService.connect(interaction.guildId, poolId, channelId);

                interaction.reply({ content: `Connected pool #${poolId}! 🥳`, ephemeral: true });

                break;
            }

            case 'disconnect': {
                const guild = await GuildService.get(interaction.guildId);
                if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

                const channel: any = client.channels.cache.get(guild.channelId);
                channel.send('Bye!:wave: I hope you enjoy your rewards:pray:');

                await GuildService.disconnect(guild.id);
            }
        }
    },
};
