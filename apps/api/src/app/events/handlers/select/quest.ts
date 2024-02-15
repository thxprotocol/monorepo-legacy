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
import { TPointReward } from '@thxnetwork/common/lib/types';
import { serviceMap } from '@thxnetwork/api/services/interfaces/IQuestService';

export async function completeQuest(
    interaction: ButtonInteraction | StringSelectMenuInteraction,
    variant: QuestVariant,
    questId: string,
) {
    try {
        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new DiscordDisconnected();

        const Quest = serviceMap[variant].models.quest;
        const quest = await Quest.findById(questId);
        if (!quest) throw new Error('Could not find this quest.');

        const wallet = await SafeService.findPrimary(account.sub);
        if (!wallet) throw new DiscordSafeNotFound();

        const pool = await PoolService.getById(quest.poolId);
        if (!pool) throw new Error('Could not find this campaign.');

        const { interaction: questInteraction } = quest as TPointReward;
        const platformUserId = questInteraction && QuestService.findUserIdForInteraction(account, questInteraction);

        const data = {
            isClaimed: true,
            platformUserId,
        };
        const availabilityValidation = await QuestService.isAvailable(variant, {
            quest,
            account,
            wallet,
            data,
        });
        if (!availabilityValidation.result) throw new Error(availabilityValidation.reason);

        const requirementValidation = await QuestService.getValidationResult(variant, {
            quest,
            account,
            wallet,
            data,
        });
        if (!requirementValidation.result) throw new Error(requirementValidation.reason);

        const amount = await QuestService.getAmount(variant, quest, account, wallet);

        await agenda.now(JobType.CreateQuestEntry, {
            variant,
            questId: quest._id,
            sub: account.sub,
            data,
        });

        interaction.reply({
            content: `Completed **${quest.title}** and earned **${amount} points**.`,
            ephemeral: true,
        });
    } catch (error) {
        handleError(error, interaction);
    }
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

        const data = {};
        const isAvailable = await QuestService.isAvailable(variant, { quest, account, wallet, data });
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
                url: `${pool.campaignURL}/quests`,
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
