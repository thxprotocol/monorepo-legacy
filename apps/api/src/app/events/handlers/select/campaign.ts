import { StringSelectMenuInteraction } from 'discord.js';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { guildMap } from '@thxnetwork/api/events/components';

export async function handleCampaignConnect(interaction: StringSelectMenuInteraction) {
    const { user, values } = interaction;
    const account = await AccountProxy.getByDiscordId(user.id);
    const poolId = values[0];
    const guild = guildMap[poolId];
    const pool = await PoolService.getById(poolId);
    const filter = { poolId, guildId: guild.id };
    const payload = {
        ...filter,
        sub: String(account._id),
        name: guild.name,
    };

    await DiscordGuild.findOneAndUpdate(filter, payload, { upsert: true });
    interaction.reply({ content: `Yay!🥳 Connected **${pool.settings.title}** to the server.`, ephemeral: true });
}
