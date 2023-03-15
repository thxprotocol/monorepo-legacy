import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { thxClient } from '../../config/oidc';
import GuildService from '../../services/guild.service';
import { client } from '../../../bootstrap';
import { version } from '../../../../package.json';

export const onSubcommandInfo = async (interaction: CommandInteraction) => {
    const embed = new EmbedBuilder();
    const guild = await GuildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const pool = await thxClient.pools.get(guild.poolId);
    if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });

    const { widget, brand } = pool;
    if (!widget) return interaction.reply({ content: 'Widget could not be found.', ephemeral: true });

    const channel: any = await client.channels.fetch(guild.channelId);
    if (!channel) return interaction.reply({ content: 'Channel could not be found.', ephemeral: true });

    const { dailyRewards, pointRewards } = await thxClient.rewardsManager.list(guild.poolId);
    const { erc20Perks, erc721Perks } = await thxClient.perksManager.list(guild.poolId);

    embed.setColor(widget.bgColor);
    embed.setURL(widget.domain);
    embed.setTitle(pool.title);

    if (widget.message) {
        embed.setDescription(widget.message);
    }

    if (brand && brand.logoImgUrl) {
        embed.setThumbnail(brand.logoImgUrl);
    }

    embed.addFields({ name: 'Domain', value: `[${widget.domain}](${widget.domain})`, inline: true });
    embed.addFields({ name: 'Version', value: `v${version}`, inline: true });

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
                name: ':gem: Coin Perks',
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

    return interaction.reply({ embeds: [embed], ephemeral: true });
};
