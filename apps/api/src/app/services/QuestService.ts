import { DailyRewardClaimState, JobType, QuestVariant } from '@thxnetwork/types/enums';
import {
    TAccount,
    TBrand,
    TDailyReward,
    TMilestoneRewardClaim,
    TQuest,
    TQuestEntry,
    TWallet,
    TWidget,
} from '@thxnetwork/types/interfaces';
import { DailyReward } from './DailyRewardService';
import { ReferralReward } from '../models/ReferralReward';
import { PointReward } from './PointRewardService';
import { Web3Quest } from '../models/Web3Quest';
import { MilestoneReward } from '../models/MilestoneReward';
import { v4 } from 'uuid';
import { Widget } from '../models/Widget';
import DiscordDataProxy from '../proxies/DiscordDataProxy';
import PoolService from './PoolService';
import BrandService from './BrandService';
import NotificationService from './NotificationService';
import { DailyRewardClaim } from '../models/DailyRewardClaims';
import { ReferralRewardClaim } from '../models/ReferralRewardClaim';
import { PointRewardClaim } from '../models/PointRewardClaim';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import { Web3QuestClaim } from '../models/Web3QuestClaim';
import PointBalanceService from './PointBalanceService';
import { AssetPoolDocument } from '../models/AssetPool';
import { celebratoryWords } from '../util/dictionaries';
import { ONE_DAY_MS } from './DailyRewardClaimService';
import { agenda } from '../util/agenda';
import { ButtonStyle } from 'discord.js';
import { WIDGET_URL } from '../config/secrets';
import { DiscordButtonVariant } from '../events/InteractionCreated';

function formatAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

const getEntryModel = (variant: QuestVariant) => {
    const map = {
        [QuestVariant.Daily]: DailyRewardClaim,
        [QuestVariant.Invite]: ReferralRewardClaim,
        [QuestVariant.Twitter]: PointRewardClaim,
        [QuestVariant.Discord]: PointRewardClaim,
        [QuestVariant.YouTube]: PointRewardClaim,
        [QuestVariant.Custom]: MilestoneRewardClaim,
        [QuestVariant.Web3]: Web3QuestClaim,
    };

    return map[variant] as any;
};

const getModel = (variant: QuestVariant) => {
    const map = {
        [QuestVariant.Daily]: DailyReward,
        [QuestVariant.Invite]: ReferralReward,
        [QuestVariant.Twitter]: PointReward,
        [QuestVariant.Discord]: PointReward,
        [QuestVariant.YouTube]: PointReward,
        [QuestVariant.Custom]: MilestoneReward,
        [QuestVariant.Web3]: Web3Quest,
    };

    return map[variant] as any;
};

async function notify(variant: QuestVariant, quest: TQuest) {
    const pool = await PoolService.getById(quest.poolId);
    const brand = await BrandService.get(quest.poolId);
    const widget = await Widget.findOne({ poolId: pool._id });

    notifyEmail(pool, variant, quest as TQuest, widget);
    notifyDiscord(pool, variant, quest as TQuest, widget, brand);
}

async function notifyEmail(pool: AssetPoolDocument, variant: QuestVariant, quest: TQuest, widget: TWidget) {
    const { amount, amounts } = quest as any;
    const subject = `🎁 New ${QuestVariant[variant]} Quest: Earn ${amount || amounts[0]} pts!"`;
    const message = `<p style="font-size: 18px">Earn ${amount || amounts[0]} points!🔔</p>
    <p>Hi! <strong>${pool.settings.title}</strong> just published a new ${QuestVariant[variant]} Quest.
    <p><strong>${quest.title}</strong><br />${quest.description}.</p>`;

    NotificationService.send(pool, {
        subjectId: quest.uuid,
        subject,
        message,
        link: { text: `Complete ${QuestVariant[variant]} Quest`, src: widget.domain },
    });
}

async function notifyDiscord(
    pool: AssetPoolDocument,
    variant: QuestVariant,
    quest: TQuest,
    widget: TWidget,
    brand?: TBrand,
) {
    const theme = JSON.parse(widget.theme);
    const { amount, amounts } = quest as any;

    const embed = {
        title: quest.title,
        description: quest.description,
        author: {
            name: pool.settings.title,
            icon_url: brand ? brand.logoImgUrl : '',
            url: widget.domain,
        },
        thumbnail: { url: quest.image },
        color: parseInt(theme.elements.btnBg.color.replace(/^#/, ''), 16),
        fields: [
            {
                name: 'Points',
                value: `${amount || amounts[0]}`,
                inline: true,
            },
            {
                name: 'Type',
                value: `${QuestVariant[quest.variant]}`,
                inline: true,
            },
        ],
    };

    await DiscordDataProxy.sendChannelMessage(
        pool,
        `Hi @everyone! **${pool.settings.title}** just published a **${QuestVariant[variant]} Quest**.`,
        [embed],
        [
            {
                customId: `${DiscordButtonVariant.QuestComplete}:${quest.variant}:${quest._id}`,
                label: 'Complete Quest!',
                style: ButtonStyle.Success,
            },
            { label: 'More Info', style: ButtonStyle.Link, url: WIDGET_URL + `/c/${pool._id}/quests` },
        ],
    );
}

async function update(variant: QuestVariant, questId: string, data: Partial<TQuest>) {
    const model = getModel(variant);
    const quest = await model.findById(questId);

    // We only want to notify when the quest is set to published (and not updated while published already)
    if (data.isPublished && Boolean(data.isPublished) !== quest.isPublished) {
        await notify(variant, { ...quest.toJSON(), ...data, image: data.image || quest.image });
    }

    return await model.findByIdAndUpdate(questId, data, { new: true });
}

async function create(variant: QuestVariant, poolId: string, data: Partial<TQuest>) {
    const model = getModel(variant);
    const quest = await model.create({ ...data, poolId, variant, uuid: v4() });

    if (data.isPublished) {
        await notify(variant, quest);
    }

    return quest;
}

async function complete(
    variant: QuestVariant,
    amount: number,
    pool: AssetPoolDocument,
    quest: TQuest,
    account: TAccount,
    wallet: TWallet,
    data: Partial<TQuestEntry>,
) {
    const model = getEntryModel(variant);
    const index = Math.floor(Math.random() * celebratoryWords.length);
    const discord = account.connectedAccounts && account.connectedAccounts.find((a) => a.kind === 'discord');
    const user =
        discord && discord.userId
            ? `<@${discord.userId}>`
            : `**${account.username ? account.username : formatAddress(wallet.address)}**`;
    const button = {
        customId: `${DiscordButtonVariant.QuestComplete}:${quest.variant}:${quest._id}`,
        label: 'Complete Quest',
        style: ButtonStyle.Primary,
    };
    const content = `${celebratoryWords[index]} ${user} completed the **${quest.title}** quest and earned **${amount} points.**`;

    await DiscordDataProxy.sendChannelMessage(pool, content, [], [button]);

    const { isEnabledWebhookQualification } = quest as TDailyReward;
    const entry =
        variant === QuestVariant.Daily && isEnabledWebhookQualification
            ? // Handle Daily Quest entry update after webhook is invoked (if webhook qualification is enabled)
              await model.create({
                  dailyRewardId: String(quest._id),
                  sub: account.sub,
                  walletId: wallet._id,
                  createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
                  state: DailyRewardClaimState.Claimed,
              })
            : // Handle all other quest variants
              await model.create({
                  sub: account.sub,
                  walletId: wallet._id,
                  amount,
                  ...data,
                  poolId: pool._id,
                  uuid: v4(),
              });

    await PointBalanceService.add(pool, wallet._id, amount);

    await agenda.now(JobType.UpdateParticipantRanks, { poolId: pool._id });

    return entry;
}

function findById(variant: QuestVariant, questId) {
    const model = getModel(variant);
    return model.findById(questId);
}

export default { getModel, create, update, complete, findById };
