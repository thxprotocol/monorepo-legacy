import { StringSelectMenuInteraction } from 'discord.js';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';

export async function handleCampaignConnect(interaction: StringSelectMenuInteraction) {
    const { user, values } = interaction;
    const account = await AccountProxy.getByDiscordId(user.id);
    const { guildId, guildName, poolId } = JSON.parse(values[0]);
    const pool = await PoolService.getById(poolId);
    const filter = { poolId, guildId };
    const payload = {
        ...filter,
        sub: String(account._id),
        name: guildName,
    };

    await DiscordGuild.findOneAndUpdate(filter, payload, { upsert: true });
    interaction.reply({ content: `Yay!🥳 Connected **${pool.settings.title}** to the server.`, ephemeral: true });
}
