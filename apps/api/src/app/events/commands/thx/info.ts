import { ButtonStyle, CommandInteraction, Embed } from 'discord.js';
import { Participant, Widget, Brand, Pool } from '@thxnetwork/api/models';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { DiscordButtonVariant } from '../../InteractionCreated';
import { handleError } from '../error';
import { getDiscordGuild } from './points';

export const onSubcommandInfo = async (interaction: CommandInteraction) => {
    try {
        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new Error('Please, connect your Discord.');

        const { discordGuild, error } = await getDiscordGuild(interaction);
        if (error) throw new Error(error);

        const pool = await Pool.findById(discordGuild.poolId);
        if (!pool) throw new Error('Could not find connected campaign.');

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
                url: `${pool.campaignURL}`,
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
                    value: participant ? `${participant.balance}` : '0',
                    inline: true,
                },
                {
                    name: `Rank`,
                    value: participant && participant.rank > 0 ? `#${participant.rank}` : 'None',
                    inline: true,
                },
            ],
        } as Embed;

        if (brand && brand.backgroundImgUrl) {
            embed['image'] = { url: brand && brand.backgroundImgUrl };
        }

        if (brand && brand.logoImgUrl) {
            embed['thumbnail'] = {
                url: brand.logoImgUrl,
            };
        }

        interaction.reply({ embeds: [embed], components: [row as any], ephemeral: true });
    } catch (error) {
        handleError(error, interaction);
    }
};
export default { onSubcommandInfo };
