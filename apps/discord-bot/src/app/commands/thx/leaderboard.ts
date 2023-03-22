import { CommandInteraction, EmbedBuilder, Client } from 'discord.js';
import { thxClient } from '../../config/oidc';
import GuildService from '../../services/guild.service';

export const onSubcommandLeaderboard = async (interaction: CommandInteraction) => {
    const embed = new EmbedBuilder();
    const guild = await GuildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const pool = await thxClient.pools.get(guild.poolId);
    if (!pool) return interaction.reply({ content: 'Pool could not be found.', ephemeral: true });

    const { widget, brand } = pool;
    if (!widget) return interaction.reply({ content: 'Widget could not be found.', ephemeral: true });

    const leaderboard = await thxClient.pools.getLeaderboard(pool._id);

    //embed.setColor(widget.bgColor).setTitle(pool.title);
    embed.setTitle(pool.title);

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

    embed.addFields({ name: ':trophy: │ Leaderboard', value: ' ' });
    embed.addFields({ name: ' ', value: ' ' });

    if (leaderboard.length) {
        const client = new Client({ intents: 'GuildMembers' });
        embed.addFields(
            leaderboard.map((r, index) => {
                let userName = '';
                if (r.account.discordUserId) {
                    const user = client.users.cache.get(r.account.discordUserId);
                    if (user) {
                        userName = user.username;
                    }
                }
                return {
                    name: `${index + 1}. ${r.score} | ${userName} ${
                        r.account.address ? r.account.address.substring(0, 7) + '...' : ''
                    }`,
                    value: ' ',
                };
            }),
        );
        embed.addFields({ name: ' ', value: ' ' });
    }

    interaction.reply({ embeds: [embed], ephemeral: true });
};
