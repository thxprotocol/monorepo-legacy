import { EmbedBuilder, channelLink } from 'discord.js';
import { thxClient } from '../../config/oidc';
import GuildService from '../../services/guild.service';
import { client } from '../../../bootstrap';

export const onSubcommandInfo = async (interaction) => {
    const guild = await GuildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const pool = await thxClient.pools.get(guild.poolId);
    if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });

    const channel: any = await client.channels.fetch(guild.channelId);
    if (!channel) return interaction.reply({ content: 'Channel could not be found.', ephemeral: true });

    const { dailyRewards, pointRewards } = await thxClient.rewardsManager.list(guild.poolId);
    const { erc20Perks, erc721Perks } = await thxClient.perksManager.list(guild.poolId);

    const embed = new EmbedBuilder()
        .setColor(pool.widget.bgColor)
        .setURL(pool.widget.domain)
        .setThumbnail(pool.brand ? pool.brand.logoImgUrl : '')
        .setTitle(pool.title)
        .setDescription(pool.widget.message)
        .addFields(
            {
                name: 'Domain',
                value: `[${pool.widget.domain}](${pool.widget.domain})`,
                inline: true,
            },
            {
                name: 'Notifications',
                value: `[${channel.name}](${channelLink(guild.channelId, guild.id)})`,
                inline: true,
            },
        );

    if (dailyRewards.length) {
        embed
            .addFields({
                name: ':calendar: Daily rewards',
                value: 'Earn points every day with daily rewards.',
            })
            .addFields(
                dailyRewards.map((r) => {
                    return {
                        name: `• ${r.title} (${r.amount})`,
                        value: r.description,
                    };
                }),
            );
    }
    if (pointRewards.length) {
        embed
            .addFields({
                name: ':sparkles: Conditional rewards',
                value: 'Earn points for engagement in other platforms with conditional rewards.',
            })
            .addFields(
                pointRewards.map((r) => {
                    return {
                        name: `• ${r.title} (${r.amount})`,
                        value: r.description,
                    };
                }),
            );
    }

    // Add referral rewards

    // Add milestone rewards

    if (erc20Perks.length) {
        embed
            .addFields({
                name: ':diamond_shape_with_a_dot_inside: Coin Perks',
                value: 'Redeem points for coins.',
            })
            .addFields(
                erc20Perks.map((r) => {
                    return {
                        name: `• ${r.title} (${r.amount})`,
                        value: r.description,
                    };
                }),
            );
    }
    if (erc721Perks.length) {
        embed
            .addFields({
                name: ':star: NFT Perks',
                value: "Redeem points for NFT's.",
            })
            .addFields(
                erc721Perks.map((r) => {
                    return {
                        name: `• ${r.title} (${r.amount})`,
                        value: r.description,
                    };
                }),
            );
    }
    return await interaction.reply({ embeds: [embed], ephemeral: true });
};
