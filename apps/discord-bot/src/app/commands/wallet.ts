import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { thxClient } from '../configs/oidc';
import guildService from '../services/guild.service';

export default {
    data: new SlashCommandBuilder().setName('wallet').setDescription('Show your loyalty point balance.'),
    executor: async (interaction: CommandInteraction) => {
        const guild = await guildService.get(interaction.guildId);
        if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

        const account = await thxClient.account.getByDiscordId(interaction.user.id);
        const pointBalance = await thxClient.account.discord.pointBalance(account._id, guild.poolId);

        const embed = new EmbedBuilder()
            .setTitle('Wallet')
            .addFields({
                name: ' :sparkles: Points',
                value: `${pointBalance.balance}`,
            })
            .setTimestamp();

        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
