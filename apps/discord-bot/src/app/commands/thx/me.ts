import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { thxClient } from '../../config/oidc';
import guildService from '../../services/guild.service';

export const onSubcommandMe = async (interaction: CommandInteraction) => {
    const guild = await guildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const pool = await thxClient.pools.get(guild.poolId);
    if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });

    const { widget, brand } = pool;
    if (!widget) return interaction.reply({ content: 'Widget could not be found.', ephemeral: true });

    const account = await thxClient.account.getByDiscordId(interaction.user.id);
    if (!account)
        return interaction.reply({
            content: `Account not found for your Discord ID. Visit [${pool.widget.domain}](${pool.widget.domain})`,
            ephemeral: true,
        });

    const pointBalance = await thxClient.account.discord.pointBalance(account._id, guild.poolId);
    if (!pointBalance) return interaction.reply({ content: 'Point balance not found for account.', ephemeral: true });

    const embed = new EmbedBuilder().setColor(pool.widget.bgColor).setURL(pool.widget.domain);
    if (brand && brand.logoImgUrl) {
        embed.setThumbnail(pool.brand.logoImgUrl);
    }

    embed
        .setTitle('Your Account')
        .setDescription(`Earn more points at ${pool.widget.domain}!`)
        .addFields({
            name: ':sparkles: Points',
            value: `${pointBalance.balance}`,
        })
        .addFields({
            name: ':sparkles: Wallet',
            value: `${account.walletAddress}`,
        })
        .setTimestamp();

    interaction.reply({ embeds: [embed], ephemeral: true });
};
