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
        embed.addFields({ name: ' ', value: ' ' });
    }

    if (brand && brand.logoImgUrl) {
        embed.setThumbnail(brand.logoImgUrl);
    }

    embed.addFields({ name: 'Widget', value: widget.domain, inline: true });
    embed.addFields({ name: 'Version', value: version, inline: true });
    embed.addFields({ name: ' ', value: ' ' });

    if (dailyRewards.length || pointRewards.length) {
        embed.addFields({ name: ':trophy: │ Points', value: ' ' });
        embed.addFields({ name: ' ', value: ' ' });
    }

    if (dailyRewards.length) {
        embed.addFields(
            dailyRewards.map((r) => {
                return { name: `${r.amount} Points`, value: r.title };
            }),
        );
        embed.addFields({ name: ' ', value: ' ' });
    }

    if (pointRewards.length) {
        embed.addFields(
            pointRewards.map((r) => {
                return { name: `${r.amount} Points`, value: r.title };
            }),
        );
        embed.addFields({ name: ' ', value: ' ' });
    }

    if (erc20Perks.length || erc721Perks.length) {
        embed.addFields({ name: ':gift: │ Perks', value: ' ' });
        embed.addFields({ name: ' ', value: ' ' });
    }

    if (erc20Perks.length) {
        embed.addFields(
            erc20Perks.map((r) => {
                return { name: r.title, value: r.title };
            }),
        );
        embed.addFields({ name: ' ', value: ' ' });
    }

    if (erc721Perks.length) {
        embed.addFields(
            erc721Perks.map((r) => {
                return { name: r.pointPrice, value: r.title };
            }),
        );
        embed.addFields({ name: ' ', value: ' ' });
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
};
