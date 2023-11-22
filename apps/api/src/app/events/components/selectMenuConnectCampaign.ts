import PoolService from '@thxnetwork/api/services/PoolService';
import { TAccount } from '@thxnetwork/types/interfaces';
import {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    Guild,
} from 'discord.js';

async function createSelectMenuConnectCampaign(account: TAccount, guild: Guild) {
    const pools = await PoolService.getAllBySub(account._id);
    const select = new StringSelectMenuBuilder();
    select.setCustomId('thx.campaign.connect').setPlaceholder('Connect a campaign');

    for (const index in pools) {
        const pool = pools[index];
        const embed = new EmbedBuilder();
        const { title, description } = pool.settings;

        const value = JSON.stringify({
            guildId: guild.id,
            guildName: guild.name,
            poolId: String(pool._id),
        });
        const options = new StringSelectMenuOptionBuilder().setLabel(String(title)).setValue(value);

        embed.setTitle(title);

        if (description) {
            embed.setDescription(description);
            options.setDescription(description);
        }

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuConnectCampaign };
