import { StringSelectMenuInteraction } from 'discord.js';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';

export async function handleCampaignConnect(interaction: StringSelectMenuInteraction) {
    const { guild, user, values } = interaction;
    const account = await AccountProxy.getByDiscordId(user.id);
    const pool = await PoolService.getById(values[0]);
    const filter = {
        poolId: String(pool._id),
        guildId: guild.id,
    };
    const payload = {
        ...filter,
        sub: String(account._id),
        name: guild.name,
    };

    await DiscordGuild.findOneAndUpdate(filter, payload, { upsert: true });

    interaction.reply({ content: `Connected **${pool.settings.title}**` });
}
