import { StringSelectMenuInteraction } from 'discord.js';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import GuildService from '@thxnetwork/api/services/GuildService';
import PoolService from '@thxnetwork/api/services/PoolService';

export async function handleCampaignConnect(interaction: StringSelectMenuInteraction) {
    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    const pool = await PoolService.getById(interaction.values[0]);
    await GuildService.connect({
        sub: String(account._id),
        poolId: String(pool._id),
        guildId: interaction.guild.id,
    });
    interaction.reply({ content: `Connected **${pool.settings.title}**` });
}
