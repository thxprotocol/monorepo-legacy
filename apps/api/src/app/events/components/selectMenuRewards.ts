import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Guild } from 'discord.js';
import { DiscordStringSelectMenuVariant } from '../InteractionCreated';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { CustomReward } from '@thxnetwork/api/models/CustomReward';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';
import { DiscordRoleReward } from '@thxnetwork/api/models/DiscordRoleReward';

async function createSelectMenuRewards(guild: Guild) {
    const { poolId } = await DiscordGuild.findOne({ guildId: guild.id });
    const results = await Promise.all([
        ERC20Perk.find({ poolId, pointPrice: { $gt: 0 } }),
        ERC721Perk.find({ poolId, pointPrice: { $gt: 0 } }),
        CustomReward.find({ poolId, pointPrice: { $gt: 0 } }),
        CouponReward.find({ poolId, pointPrice: { $gt: 0 } }),
        DiscordRoleReward.find({ poolId, pointPrice: { $gt: 0 } }),
    ]);
    const rewards = results.flat();
    const select = new StringSelectMenuBuilder();
    select.setCustomId(DiscordStringSelectMenuVariant.RewardBuy).setPlaceholder('Buy a reward');

    for (const index in rewards) {
        const reward = rewards[index];
        const { title, description } = reward;
        const questId = String(reward._id);
        const value = JSON.stringify({ questId, variant: reward.variant });
        const options = new StringSelectMenuOptionBuilder().setLabel(String(title)).setValue(value);

        if (description) {
            options.setDescription(description);
        }

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuRewards };
