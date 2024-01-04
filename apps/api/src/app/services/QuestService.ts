import { JobType, QuestVariant } from '@thxnetwork/types/enums';
import { TAccount, TBrand, TQuest, TQuestEntry, TWallet, TWidget } from '@thxnetwork/types/interfaces';
import { DailyReward } from './DailyRewardService';
import { ReferralReward, ReferralRewardDocument } from '../models/ReferralReward';
import QuestSocialService, { PointReward } from './PointRewardService';
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
import { agenda } from '../util/agenda';
import { ButtonStyle } from 'discord.js';
import { WIDGET_URL } from '../config/secrets';
import { DiscordButtonVariant } from '../events/InteractionCreated';
import DailyRewardClaimService from './DailyRewardClaimService';
import { WalletDocument } from '../models/Wallet';
import { PointRewardDocument } from '../models/PointReward';
import MilestoneRewardService from './MilestoneRewardService';
import PointRewardService from './PointRewardService';

type TValidationResult = {
    result: boolean;
    reason: string;
};

function formatAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

const getPointsQuest = async (quest: ReferralRewardDocument) => quest.amount;
const getPointsSocialQuest = async (quest, account, wallet) => {
    const { pointsAvailable } = await QuestSocialService.getPointsAvailable(quest, account);
    return pointsAvailable;
};
const getPointsDailyQuest = async (quest, account, wallet) => {
    const claims = await DailyRewardClaimService.findByWallet(quest, wallet);
    const amountIndex = claims.length >= quest.amounts.length ? claims.length % quest.amounts.length : claims.length;
    return quest.amounts[amountIndex];
};
const isValidSocialQuest = async (quest, account, wallet) => await QuestSocialService.validate(quest, account, wallet);
const isValidCustomQuest = async (quest, account, wallet) => await MilestoneRewardService.validate(quest, wallet);
const isValidDailyQuest = async (quest, account, wallet) => await DailyRewardClaimService.validate(quest, wallet);
const isNotImplemented = async (quest, account, wallet) => ({
    result: false,
    reason: 'Sorry, support not yet implemented...',
});

const getDataQuestDaily = (quest) => ({
    dailyRewardId: String(quest._id),
});
const getDataQuestSocial = (quest: PointRewardDocument, platformUserId: string) => ({
    pointRewardId: String(quest._id),
    platformUserId,
});
const getDataQuestCustom = (quest: PointRewardDocument) => ({
    milestoneRewardId: String(quest._id),
    isClaimed: true,
});

const getDataQuestWeb3 = (quest, chainId, address) => ({
    web3QuestId: quest._id,
    chainId,
    address,
});

const getAvailability = async (quest, account, wallet) => true;
const getAvailabilityQuestSocial = (quest, account, wallet) => PointRewardService.isAvailable(quest, account, wallet);
const getAvailabilityQuestDaily = (quest, account, wallet) =>
    DailyRewardClaimService.isAvailable(quest, account, wallet);

const questMap: {
    [variant: number]: {
        models: { quest: any; entry: any };
        methods: {
            getData: (quest: TQuest, ...any) => Partial<TQuestEntry>;
            getAmount: (quest, account, wallet) => Promise<number>;
            getValidationResult: (quest, account, wallet) => Promise<TValidationResult>;
            isAvailable: (quest, account, wallet) => Promise<boolean>;
        };
    };
} = {
    [QuestVariant.Daily]: {
        models: { quest: DailyReward, entry: DailyRewardClaim },
        methods: {
            getData: getDataQuestDaily,
            getAmount: getPointsDailyQuest,
            getValidationResult: isValidDailyQuest,
            isAvailable: getAvailabilityQuestDaily,
        },
    },
    [QuestVariant.Invite]: {
        models: { quest: ReferralReward, entry: ReferralRewardClaim },
        methods: {
            getAmount: getPointsQuest,
            getValidationResult: isNotImplemented,
            getData: getDataQuestSocial,
            isAvailable: getAvailability,
        },
    },
    [QuestVariant.Twitter]: {
        models: { quest: PointReward, entry: PointRewardClaim },
        methods: {
            getAmount: getPointsSocialQuest,
            getValidationResult: isValidSocialQuest,
            getData: getDataQuestSocial,
            isAvailable: getAvailabilityQuestSocial,
        },
    },
    [QuestVariant.Discord]: {
        models: { quest: PointReward, entry: PointRewardClaim },
        methods: {
            getAmount: getPointsSocialQuest,
            getValidationResult: isValidSocialQuest,
            getData: getDataQuestSocial,
            isAvailable: getAvailabilityQuestSocial,
        },
    },
    [QuestVariant.YouTube]: {
        models: { quest: PointReward, entry: PointRewardClaim },
        methods: {
            getAmount: getPointsSocialQuest,
            getValidationResult: isValidSocialQuest,
            getData: getDataQuestSocial,
            isAvailable: getAvailabilityQuestSocial,
        },
    },
    [QuestVariant.Custom]: {
        models: { quest: MilestoneReward, entry: MilestoneRewardClaim },
        methods: {
            getAmount: getPointsQuest,
            getValidationResult: isValidCustomQuest,
            getData: getDataQuestCustom,
            isAvailable: getAvailability,
        },
    },
    [QuestVariant.Web3]: {
        models: { quest: Web3Quest, entry: Web3QuestClaim },
        methods: {
            getAmount: getPointsQuest,
            getValidationResult: isValidCustomQuest,
            getData: getDataQuestWeb3,
            isAvailable: getAvailability,
        },
    },
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
        image: { url: quest.image },
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
        `Hi @everyone! We published a **${QuestVariant[variant]} Quest**.`,
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
    const model = questMap[variant].models.quest;
    const quest = await model.findById(questId);

    // We only want to notify when the quest is set to published (and not updated while published already)
    if (data.isPublished && Boolean(data.isPublished) !== quest.isPublished) {
        await notify(variant, { ...quest.toJSON(), ...data, image: data.image || quest.image });
    }

    return await model.findByIdAndUpdate(questId, data, { new: true });
}

async function create(variant: QuestVariant, poolId: string, data: Partial<TQuest>) {
    const model = questMap[variant].models.quest;
    const quest = await model.create({ ...data, poolId, variant, uuid: v4() });

    if (data.isPublished) {
        await notify(variant, quest);
    }

    return quest;
}

function getAmount(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
    return questMap[variant].methods.getAmount(quest, account, wallet);
}

function isAvailable(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
    return questMap[variant].methods.isAvailable(quest, account, wallet);
}

function validate(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
    return questMap[variant].methods.getValidationResult(quest, account, wallet);
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
    const model = questMap[variant].models.entry;
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
    const entry = await model.create({
        sub: account.sub,
        walletId: wallet._id,
        amount,
        ...data,
        poolId: pool._id,
        uuid: v4(),
    });

    await PointBalanceService.add(pool, wallet._id, amount);
    await DiscordDataProxy.sendChannelMessage(pool, content, [], [button]);
    await agenda.now(JobType.UpdateParticipantRanks, { poolId: pool._id });

    return entry;
}

function findById(variant: QuestVariant, questId: string) {
    const model = questMap[variant].models.quest;
    return model.findById(questId);
}

export { questMap };
export default { getAmount, isAvailable, create, update, complete, validate, findById };
