import { DailyRewardClaimState, JobType, QuestVariant } from '@thxnetwork/types/enums';
import {
    TAccount,
    TDailyReward,
    TMilestoneRewardClaim,
    TQuest,
    TQuestEntry,
    TWallet,
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

    const embed = DiscordDataProxy.createEmbedQuest(variant, quest as TQuest, pool, widget, brand);
    await DiscordDataProxy.sendChannelMessage(
        pool.settings.discordWebhookUrl,
        `Hi all! **${pool.settings.title}** just published a **${QuestVariant[variant]} Quest**.`,
        [embed],
    );
}

async function update(variant: QuestVariant, questId: string, data: Partial<TQuest>) {
    const model = getModel(variant);
    const quest = await model.findById(questId);

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
    const widget = await Widget.findOne({ poolId: pool._id });
    const index = Math.floor(Math.random() * celebratoryWords.length);
    const discord = account.connectedAccounts && account.connectedAccounts.find((a) => a.kind === 'discord');
    const user =
        discord && discord.userId
            ? `<@${discord.userId}>`
            : `**${account.username ? account.username : formatAddress(wallet.address)}**`;

    await DiscordDataProxy.sendChannelMessage(
        pool.settings.discordWebhookUrl,
        `${celebratoryWords[index]} ${user} completed the **${quest.title}** quest and earned **${amount} pts**\n[Complete ${QuestVariant[variant]} Quest ▸](<${widget.domain}>)`,
    );

    let entry: TQuestEntry;
    const { isEnabledWebhookQualification } = quest as TDailyReward;
    // Handle Daily Quest entry update after webhook is invoked (if webhook qualification is enabled)
    if (variant === QuestVariant.Daily && isEnabledWebhookQualification) {
        entry = await model.findOneAndUpdate(
            {
                dailyRewardId: String(quest._id),
                sub: account.sub,
                walletId: wallet._id,
                state: DailyRewardClaimState.Pending,
                createdAt: { $gt: new Date(Date.now() - ONE_DAY_MS) }, // Greater than now - 24h
            },
            { state: DailyRewardClaimState.Claimed },
            { new: true },
        );
    }
    // Handle Custom Quest entry update after webhook is invoked
    else if (variant === QuestVariant.Custom) {
        const { uuid } = data as TMilestoneRewardClaim;
        entry = await model.findOneAndUpdate({ uuid }, { isClaimed: true }, { new: true });
    }

    // Handle all other variants
    else {
        entry = await model.create({
            sub: account.sub,
            walletId: wallet._id,
            amount,
            ...data,
            poolId: pool._id,
            uuid: v4(),
        });
    }

    await PointBalanceService.add(pool, wallet._id, amount);

    await agenda.now(JobType.UpdateParticipantRanks, { poolId: pool._id });

    return entry;
}

function findById(variant: QuestVariant, questId) {
    const model = getModel(variant);
    return model.findById(questId);
}

export default { getModel, create, update, complete, findById };
