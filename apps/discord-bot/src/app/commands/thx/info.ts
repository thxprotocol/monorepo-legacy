import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { thxClient } from '../../config/oidc';
import GuildService from '../../services/guild.service';
import { client } from '../../../bootstrap';

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

    const { dailyRewards, referralRewards, pointRewards, milestoneRewards } = await thxClient.rewardsManager.list(
        guild.poolId,
    );
    const { erc20Perks, erc721Perks } = await thxClient.perksManager.list(guild.poolId);
    const theme = JSON.parse(widget.theme);

    embed.setColor(theme.colors.accent.color);
    embed.setTitle(pool.settings.title);

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

    embed.setDescription(`Earn and redeem points! [Visit our site](${widget.domain})`);

    embed.addFields({ name: ':trophy: Earn points', value: ' ' });
    let dailyRewardEntries = dailyRewards.length ? '' : '```None```';
    for (const r of dailyRewards) {
        dailyRewardEntries += `- \`${r.amount}\` ${r.title}\n`;
    }
    embed.addFields({ name: 'Daily', value: `${dailyRewardEntries}` });

    let referralRewardEntries = referralRewards.length ? '' : '```None```';
    for (const r of referralRewards) {
        referralRewardEntries += `- \`${r.amount}\` ${r.title}\n`;
    }
    embed.addFields({ name: 'Referral', value: `${referralRewardEntries}` });

    let pointRewardEntries = pointRewards.length ? '' : '```None```';
    for (const r of pointRewards) {
        pointRewardEntries += `- \`${r.amount}\` ${r.title}\n`;
    }
    embed.addFields({ name: 'Conditional', value: `${pointRewardEntries}` });

    let milestoneRewardEntries = milestoneRewards.length ? '' : '```None```';
    for (const r of milestoneRewards) {
        milestoneRewardEntries += `- \`${r.amount}\` ${r.title}\n`;
    }
    embed.addFields({ name: 'Milestone', value: `${milestoneRewardEntries}` });

    embed.addFields({ name: ' ', value: ` ` });

    embed.addFields({ name: ':gift: Shop for perks', value: ' ' });
    let erc20PerkEntries = erc20Perks.length ? '' : '```None```';
    for (const perk of erc20Perks) {
        erc20PerkEntries += `- \`${perk.pointPrice}\` ${perk.title}\n`;
    }
    embed.addFields({ name: 'Coin Perks', value: `${erc20PerkEntries}` });

    let erc721PerkEntries = erc721Perks.length ? '' : '```None```';
    for (const perk of erc721Perks) {
        erc721PerkEntries += `- \`${perk.pointPrice}\` ${perk.title}\n`;
    }
    embed.addFields({ name: 'Coin Perks', value: `${erc721PerkEntries}` });

    interaction.reply({ embeds: [embed], ephemeral: true });
};
