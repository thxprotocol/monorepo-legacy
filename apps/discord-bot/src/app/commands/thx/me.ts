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

    const { account, wallets } = await thxClient.account.getByDiscordId(interaction.user.id);
    if (!account)
        return interaction.reply({
            content: `Account not found for your Discord ID. Visit [${pool.widget.domain}](${pool.widget.domain})`,
            ephemeral: true,
        });

    const pointBalance = await thxClient.account.discord.pointBalance(account._id, guild.poolId);
    if (!pointBalance) return interaction.reply({ content: 'Point balance not found for account.', ephemeral: true });

    const theme = JSON.parse(widget.theme);
    const embed = new EmbedBuilder();

    if (brand && brand.logoImgUrl) {
        embed.setThumbnail(pool.brand.logoImgUrl);
    }

    embed
        .setColor(theme.colors.accent.color)
        .setURL(pool.widget.domain)
        .setTitle('Your account')
        .setDescription(`Earn and redeem points! Visit: ${pool.widget.domain}`)
        .addFields({
            name: ':sparkles: Point balance',
            value: `${String(pointBalance.balance)}`,
        });

    if (account.address) {
        embed.addFields({
            name: `:gem: Wallet`,
            value: `${account.address}`,
        });
    }

    if (wallets.length) {
        for (const wallet of wallets) {
            embed.addFields({
                name: `:identification_card: Address ${wallet.chainId}`,
                value: `${wallet.address}`,
            });
        }
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
};
