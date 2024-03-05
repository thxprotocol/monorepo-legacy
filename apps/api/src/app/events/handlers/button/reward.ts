import { ButtonInteraction } from 'discord.js';
import { RewardVariant } from '@thxnetwork/common/enums';
import { handleError } from '../../commands/error';
import {
    RewardCoin,
    RewardNFT,
    DiscordGuild,
    RewardCustom,
    RewardCoupon,
    RewardDiscordRole,
} from '@thxnetwork/api/models';

export async function onClickRewardRedeem(interaction: ButtonInteraction) {
    try {
        // Custom Id Syntax: DiscordButtonVariant.QuestComplete + ':' + questVariant ':' + questId
        const data = interaction.customId.split(':');
        const variant = data[1] as unknown as RewardVariant;
        const questId = data[2];

        // await completeReward(interaction, variant, questId);
    } catch (error) {
        handleError(error, interaction);
    }
}

export async function onClickRewardList(interaction: ButtonInteraction) {
    try {
        const discordGuild = await DiscordGuild.findOne({ guildId: interaction.guild.id });
        if (!discordGuild) throw new Error('Could not find this Discord server.');

        const { poolId } = discordGuild;
        const results = await Promise.all([
            RewardCoin.find({ poolId, pointPrice: { $gt: 0 } }),
            RewardNFT.find({ poolId, pointPrice: { $gt: 0 } }),
            RewardCustom.find({ poolId, pointPrice: { $gt: 0 } }),
            RewardCoupon.find({ poolId, pointPrice: { $gt: 0 } }),
            RewardDiscordRole.find({ poolId, pointPrice: { $gt: 0 } }),
        ]);
        const rewards = results.flat();
        if (!rewards.length) throw new Error('No rewards found for this campaign.');

        const list = rewards.map(
            (reward: any) =>
                `${String(reward.pointPrice).padStart(4)} pts. ${reward.title} (${RewardVariant[reward.variant]})`,
        );
        const code = list.join('\n');
        const embeds = [
            {
                title: `🎁 Rewards`,
                description: rewards.length
                    ? 'Use `/buy` to buy rewards with points. \n ```' + code + `\n` + '```'
                    : 'No rewards available!',
            },
        ];

        interaction.reply({ embeds, ephemeral: true });
    } catch (error) {
        handleError(error, interaction);
    }
}
