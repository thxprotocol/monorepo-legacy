import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { thxClient } from '../../config/oidc';
import GuildService from '../../services/guild.service';

export const onSubcommandLeaderboard = async (interaction: CommandInteraction) => {
    const embed = new EmbedBuilder();
    const guild = await GuildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const thx = thxClient({ poolId: guild.poolId });
    const pool = await thx.pools.get(guild.poolId);
    if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });

    const { widget, brand } = pool;
    if (!widget) return interaction.reply({ content: 'Widget could not be found.', ephemeral: true });

    const leaderboard = (await thx.pools.getLeaderboard(pool._id)).slice(0, 10);
    const theme = JSON.parse(widget.theme);

    embed.setColor(theme.colors.accent.color).setTitle(pool.settings.title);
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

    let entries = leaderboard.length ? '' : ' ';
    for (const index in leaderboard) {
        const { account, score } = leaderboard[index];
        const address = account.address ? account.address.substring(0, 8) + '...' : '';
        const rank = String(Number(index) + 1).padStart(2, '0');
        entries += `${rank} | ${address}      ${score} Points\n`;
    }

    embed.addFields({
        name: ':trophy: Leaderboard',
        value: `\`\`\`${entries}\`\`\``,
    });

    interaction.reply({ embeds: [embed], ephemeral: true });
};
