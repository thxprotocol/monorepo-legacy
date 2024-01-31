import { ButtonInteraction, ButtonStyle, StringSelectMenuInteraction } from 'discord.js';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types/enums';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import QuestService from '@thxnetwork/api/services/QuestService';
import SafeService from '@thxnetwork/api/services/SafeService';
import { handleError } from '../../commands/error';
import DiscordDataProxy from '@thxnetwork/api/proxies/DiscordDataProxy';
import { DiscordButtonVariant } from '../../InteractionCreated';
import Brand from '@thxnetwork/api/models/Brand';
import { Widget } from '@thxnetwork/api/models/Widget';
import { WIDGET_URL } from '@thxnetwork/api/config/secrets';
import { agenda } from '@thxnetwork/api/util/agenda';
import { DiscordDisconnected, DiscordSafeNotFound } from '@thxnetwork/api/util/errors';
import PointRewardService from '@thxnetwork/api/services/PointRewardService';

export async function completeQuest(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    variant: QuestVariant,
    questId: string,
) {
    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    if (!account) throw new DiscordDisconnected();

    const quest = await QuestService.findById(variant, questId);
    if (!quest) throw new Error('Could not find this quest.');

    const wallet = await SafeService.findPrimary(account.sub);
    if (!wallet) throw new DiscordSafeNotFound();

    const pool = await PoolService.getById(quest.poolId);
    if (!pool) throw new Error('Could not find this campaign.');

    const isAvailable = await QuestService.isAvailable(variant, quest, account, wallet);
    if (!isAvailable) throw new Error('Quest is not available for commands at the moment!');

    const validationResult = await QuestService.getValidationResult(variant, quest, account, wallet);
    if (!validationResult.result) throw new Error(validationResult.reason);

    const amount = await QuestService.getAmount(variant, quest, account, wallet);
    if (!amount) throw new Error('Could not figure out how much points you should get.');

    const platformUserId = PointRewardService.getPlatformUserId(quest, account);

    await agenda.now(JobType.CreateQuestEntry, {
        variant,
        questId: quest._id,
        sub: account.sub,
        data: {
            isClaimed: true,
            platformUserId,
        },
    });

    interaction.reply({
        content: `Completed **${quest.title}** and earned **${amount} points**.`,
        ephemeral: true,
    });
}

export async function onSelectQuestComplete(interaction: StringSelectMenuInteraction) {
    try {
        const { questId, variant } = JSON.parse(interaction.values[0]);

        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new DiscordDisconnected();

        const wallet = await SafeService.findPrimary(account.sub);
        if (!wallet) throw new DiscordSafeNotFound();

        const quest = await QuestService.findById(variant, questId);
        if (!quest) throw new Error('Could not find this quest.');

        const pool = await PoolService.getById(quest.poolId);
        if (!pool) throw new Error('Could not find this campaign.');

        const isAvailable = await QuestService.isAvailable(variant, quest, account, wallet);
        const brand = await Brand.findOne({ poolId: pool._id });
        const widget = await Widget.findOne({ poolId: pool._id });
        const theme = JSON.parse(widget.theme);
        const amount = await QuestService.getAmount(quest.variant, quest, account, wallet);
        const embedQuest = {
            title: quest.title,
            description: quest.description,
            author: {
                name: pool.settings.title,
                icon_url: brand ? brand.logoImgUrl : '',
                url: widget.domain,
            },
            image: { url: quest.image },
            color: parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16),
            fields: [
                {
                    name: 'Points',
                    value: `${amount}`,
                    inline: true,
                },
                {
                    name: 'Type',
                    value: `${QuestVariant[quest.variant]}`,
                    inline: true,
                },
            ],
        };

        const row = DiscordDataProxy.createButtonActionRow([
            {
                emoji: isAvailable ? '✅' : '🔒',
                label: 'Complete',
                style: ButtonStyle.Success,
                customId: `${DiscordButtonVariant.QuestComplete}:${variant}:${questId}`,
                disabled: !isAvailable,
            },
            {
                label: 'More Info',
                style: ButtonStyle.Link,
                url: `${WIDGET_URL}/c/${pool.settings.slug}/quests`,
            },
        ]);
        const components = [];
        components.push(row);

        interaction.reply({
            ephemeral: true,
            content: '',
            embeds: [embedQuest],
            components,
        });
    } catch (error) {
        handleError(error, interaction);
    }
}
