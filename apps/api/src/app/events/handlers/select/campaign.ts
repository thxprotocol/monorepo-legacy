import { StringSelectMenuInteraction } from 'discord.js';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { guildMap } from '@thxnetwork/api/events/components';

export async function onSelectCampaignConnect(interaction: StringSelectMenuInteraction) {
    try {
        const { user, values } = interaction;

        const account = await AccountProxy.getByDiscordId(user.id);
        if (!account) throw new Error('Could not find THX account for this Discord ID.');

        const poolId = values[0];
        const guild = guildMap[poolId];
        if (!guild) throw new Error('Could not find this server in cache.');

        const pool = await PoolService.getById(poolId);
        if (!account) throw new Error('Could not find this campaign.');

        const filter = { poolId, guildId: guild.id };
        const payload = {
            ...filter,
            sub: String(account._id),
            name: guild.name,
        };

        await DiscordGuild.findOneAndUpdate(filter, payload, { upsert: true });

        interaction.reply({ content: `Yay!🥳 Connected **${pool.settings.title}** to the server.`, ephemeral: true });
    } catch (error) {
        interaction.reply({ content: error.message, ephemeral: true });
    }
}
