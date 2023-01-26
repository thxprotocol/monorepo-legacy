import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { thxClient } from '../configs/oidc';
import guildService from '../services/guild.service';

export default {
    data: new SlashCommandBuilder().setName('wallet').setDescription('Show current user wallet infomation.'),
    executor: async (interaction: CommandInteraction) => {
        const account = await thxClient.account.getByDiscordId(interaction.user.id);
        const { poolId } = await guildService.get(interaction.guildId);

        const pointRes = await thxClient.account.discord.pointBalance(account._id, poolId);
        const erc20Res = await thxClient.account.discord.erc20Tokens(account._id);
        // const erc721Res = await thxClient.account.discord.erc721Tokens(account._id);

        const embed = new EmbedBuilder()
            .setTitle('Wallet Infomation')
            .addFields({
                name: 'Point Balance',
                value: `${pointRes.balance}`,
            })
            .setTimestamp();

        const erc20str = (erc20Res || [])
            .map((erc20) => {
                return `${erc20.balance || 0} ${erc20.erc20.symbol}`;
            })
            .join(',');

        embed.addFields({ name: 'ERC20', value: erc20str });

        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
