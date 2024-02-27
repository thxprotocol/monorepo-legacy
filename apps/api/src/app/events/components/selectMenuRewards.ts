import { RewardVariant } from '@thxnetwork/common/enums';
import { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, Guild } from 'discord.js';
import { DiscordStringSelectMenuVariant } from '../InteractionCreated';
import {
    DiscordGuild,
    RewardNFT,
    RewardDiscordRole,
    RewardCoin,
    RewardCustom,
    RewardCoupon,
} from '@thxnetwork/api/models';

async function createSelectMenuRewards(guild: Guild) {
    const { poolId } = await DiscordGuild.findOne({ guildId: guild.id });
    const results = await Promise.all([
        RewardCoin.find({ poolId, pointPrice: { $gt: 0 } }),
        RewardNFT.find({ poolId, pointPrice: { $gt: 0 } }),
        RewardCustom.find({ poolId, pointPrice: { $gt: 0 } }),
        RewardCoupon.find({ poolId, pointPrice: { $gt: 0 } }),
        RewardDiscordRole.find({ poolId, pointPrice: { $gt: 0 } }),
    ]);
    const rewards = results.flat();
    if (!rewards.length) throw new Error('No rewards found for this campaign.');

    const select = new StringSelectMenuBuilder();
    select.setCustomId(DiscordStringSelectMenuVariant.RewardBuy).setPlaceholder('Buy a reward');

    for (const index in rewards) {
        const reward = rewards[index];
        const questId = String(reward._id);
        const value = JSON.stringify({ questId, variant: reward.variant });
        const options = new StringSelectMenuOptionBuilder()
            .setLabel(reward.title)
            .setDescription(`${reward.pointPrice} points (${RewardVariant[reward.variant]} Reward)`)
            .setValue(value);

        select.addOptions(options);
    }

    return new ActionRowBuilder().addComponents(select);
}

export { createSelectMenuRewards };
