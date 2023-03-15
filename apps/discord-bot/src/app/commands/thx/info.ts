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

    embed.setColor(widget.bgColor).setTitle(pool.title);

    if (widget.domain) {
        embed.setURL(widget.domain);
    }

    if (widget.message) {
        embed.setDescription(widget.message);
    }

    if (brand && brand.logoImgUrl) {
        embed.setThumbnail(brand.logoImgUrl);
    }

    embed.addFields({ name: 'Widget', value: `[${widget.domain}](${widget.domain})`, inline: true });
    embed.addFields({ name: 'Version', value: `v${version}`, inline: true });

    embed.addFields({
        name: ':trophy: POINTS',
        value: ' ',
    });

    if (dailyRewards.length) {
        embed.addFields(
            dailyRewards.map((r) => {
                return {
                    name: `• ${r.amount} │ ${r.title}`,
                    value: r.description,
                };
            }),
        );
    }
    if (pointRewards.length) {
        embed.addFields(
            pointRewards.map((r) => {
                return {
                    name: `• ${r.amount} │ ${r.title} `,
                    value: r.description,
                };
            }),
        );
    }

    embed.addFields({
        name: ':gift: PERKS',
        value: ' ',
    });

    if (!erc20Perks.length) {
        embed.addFields({ name: '• Coin perks', value: 'None' });
    }

    if (erc20Perks.length) {
        embed.addFields(
            erc20Perks.map((r) => {
                return {
                    name: `• ${r.amount} │ ${r.title}`,
                    value: r.description,
                };
            }),
        );
    }

    if (!erc721Perks.length) {
        embed.addFields({ name: '• NFT perks', value: 'None' });
    }

    if (erc721Perks.length) {
        embed.addFields(
            erc721Perks.map((r) => {
                return {
                    name: `• ${r.amount} │ ${r.title}`,
                    value: r.description,
                };
            }),
        );
    }

    return interaction.reply({ embeds: [embed], ephemeral: true });
};
