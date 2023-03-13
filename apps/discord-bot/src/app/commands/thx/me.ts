import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { thxClient } from '../../configs/oidc';
import guildService from '../../services/guild.service';

export const onSubcommandMe = async (interaction: CommandInteraction) => {
    const guild = await guildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const pool = await thxClient.pools.get(guild.poolId);
    if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });

    const account = await thxClient.account.getByDiscordId(interaction.user.id);
    const pointBalance = await thxClient.account.discord.pointBalance(account._id, guild.poolId);

    const embed = new EmbedBuilder()
        .setColor(pool.widget.bgColor)
        .setURL(pool.widget.domain)
        .setThumbnail(pool.brand ? pool.brand.logoImgUrl : '')
        .setTitle('Wallet')
        .addFields({
            name: ' :sparkles: Points',
            value: `${pointBalance.balance}`,
        })
        .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });
};
