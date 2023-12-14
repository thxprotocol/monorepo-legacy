import PoolService from '@thxnetwork/api/services/PoolService';
import { TAccount } from '@thxnetwork/types/interfaces';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Guild } from 'discord.js';
import { DiscordStringSelectMenuVariant } from '../InteractionCreated';

const guildMap: { [poolId: string]: Guild } = {};

async function createSelectMenuConnectCampaign(account: TAccount, guild: Guild) {
    const pools = await PoolService.getAllBySub(account._id);
    const select = new StringSelectMenuBuilder();
    select.setCustomId(DiscordStringSelectMenuVariant.CampaignConnect).setPlaceholder('Connect a campaign');

    for (const index in pools) {
        const pool = pools[index];
        const { title, description } = pool.settings;
        const poolId = String(pool._id);

        guildMap[poolId] = guild;

        const options = new StringSelectMenuOptionBuilder().setLabel(String(title)).setValue(poolId);

        if (description) {
            options.setDescription(description);
        }

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuConnectCampaign, guildMap };
