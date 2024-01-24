import { ButtonInteraction } from 'discord.js';
import { QuestVariant, RewardVariant } from '@thxnetwork/common/lib/types/enums';
import { handleError } from '../../commands/error';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import { ERC20Perk } from '@thxnetwork/api/models/ERC20Perk';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { CustomReward } from '@thxnetwork/api/models/CustomReward';
import { CouponReward } from '@thxnetwork/api/models/CouponReward';
import { DiscordRoleReward } from '@thxnetwork/api/models/DiscordRoleReward';

export async function onClickRewardRedeem(interaction: ButtonInteraction) {
    try {
        // Custom Id Syntax: DiscordButtonVariant.QuestComplete + ':' + questVariant ':' + questId
        const data = interaction.customId.split(':');
        const variant = data[1] as unknown as RewardVariant;
        const questId = data[2];

        // await completeReward(interaction, variant, questId);
    } catch (error) {
        handleError(error);
    }
}

export async function onClickRewardList(interaction: ButtonInteraction) {
    try {
        const discordGuild = await DiscordGuild.findOne({ guildId: interaction.guild.id });
        if (!discordGuild) throw new Error('Could not find this Discord server.');

        const { poolId } = discordGuild;
        const results = await Promise.all([
            ERC20Perk.find({ poolId, pointPrice: { $gt: 0 } }),
            ERC721Perk.find({ poolId, pointPrice: { $gt: 0 } }),
            CustomReward.find({ poolId, pointPrice: { $gt: 0 } }),
            CouponReward.find({ poolId, pointPrice: { $gt: 0 } }),
            DiscordRoleReward.find({ poolId, pointPrice: { $gt: 0 } }),
        ]);
        const rewards = results.flat();
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
        handleError(error);
    }
}
