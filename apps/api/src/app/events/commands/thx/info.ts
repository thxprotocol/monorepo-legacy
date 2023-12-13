import { ButtonStyle, CommandInteraction, Embed } from 'discord.js';
import { AssetPool } from '@thxnetwork/api/models/AssetPool';
import { PointBalance } from '@thxnetwork/api/models/PointBalance';
import { Participant } from '@thxnetwork/api/models/Participant';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import SafeService from '@thxnetwork/api/services/SafeService';
import DiscordGuild from '@thxnetwork/api/models/DiscordGuild';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { DiscordButtonVariant } from '../../InteractionCreated';
import { WIDGET_URL } from '@thxnetwork/api/config/secrets';
import Brand from '@thxnetwork/api/models/Brand';
import { Widget } from '@thxnetwork/api/models/Widget';

export const onSubcommandInfo = async (interaction: CommandInteraction) => {
    try {
        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new Error('Please, connect your THX Account with Discord first.');

        const discordGuild = await DiscordGuild.findOne({ guildId: interaction.guild.id });
        if (!discordGuild) throw new Error('Could not find server in database.');

        const pool = await AssetPool.findById(discordGuild.poolId);
        if (!pool) throw new Error('Could not find connected campaign.');

        const wallet = await SafeService.findPrimary(account.sub, pool.chainId);
        if (!wallet) throw new Error('Could not find your wallet.');

        const balance = await PointBalance.findOne({
            poolId: pool._id,
            walletId: wallet._id,
        });

        const participant = await Participant.findOne({ poolId: pool._id, sub: account.sub });
        if (!participant) throw new Error('You have not participated in the campaign yet.');

        const brand = await Brand.findOne({ poolId: pool._id });
        const widget = await Widget.findOne({ poolId: pool._id });
        const theme = JSON.parse(widget.theme);
        const color = parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16);

        const row = DiscordDataProxy.createButtonActionRow([
            {
                style: ButtonStyle.Primary,
                label: 'Quests',
                customId: DiscordButtonVariant.QuestList,
                emoji: `✅`,
            },
            {
                style: ButtonStyle.Primary,
                label: 'Rewards',
                customId: DiscordButtonVariant.RewardList,
                emoji: `🎁`,
            },
            {
                style: ButtonStyle.Link,
                label: 'Campaign URL',
                url: `${WIDGET_URL}/c/${pool._id}`,
            },
        ]);

        const embed: any = {
            title: `${pool.settings.title}`,
            description: pool.settings.description ? `${pool.settings.description}` : ` `,
            color,
            fields: [
                {
                    name: `Name`,
                    value: `${account.username}`,
                },
                {
                    name: `Points`,
                    value: balance ? `${balance.balance}` : '0',
                    inline: true,
                },
                {
                    name: `Rank`,
                    value: participant && participant.rank > 0 ? `#${participant.rank}` : 'None',
                    inline: true,
                },
            ],
        } as Embed;

        if (brand && brand.logoImgUrl) {
            embed['thumbnail'] = {
                url: brand.logoImgUrl,
            };
        }

        interaction.reply({ embeds: [embed], components: [row as any], ephemeral: true });
    } catch (error) {
        interaction.reply({
            content: error.message,
            ephemeral: true,
        });
    }
};
export default { onSubcommandInfo };
