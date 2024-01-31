import { JobType, QuestVariant } from '@thxnetwork/types/enums';
import { TAccount, TPointReward, TQuest, TQuestEntry, TWallet } from '@thxnetwork/types/interfaces';
import { ReferralReward } from '../models/ReferralReward';
import { PointReward, platformInteractionMap } from './PointRewardService';
import { Web3Quest } from '../models/Web3Quest';
import { MilestoneReward } from '../models/MilestoneReward';
import { v4 } from 'uuid';
import { DailyRewardClaim } from '../models/DailyRewardClaims';
import { ReferralRewardClaim } from '../models/ReferralRewardClaim';
import { PointRewardClaim } from '../models/PointRewardClaim';
import { MilestoneRewardClaim } from '../models/MilestoneRewardClaims';
import { Web3QuestClaim } from '../models/Web3QuestClaim';
import { AssetPoolDocument } from '../models/AssetPool';
import { celebratoryWords } from '../util/dictionaries';
import { agenda } from '../util/agenda';
import { ButtonStyle } from 'discord.js';
import { DiscordButtonVariant } from '../events/InteractionCreated';
import { WalletDocument } from '../models/Wallet';
import { logger } from '../util/logger';
import { GitcoinQuest } from '../models/GitcoinQuest';
import { GitcoinQuestEntry } from '../models/GitcoinQuestEntry';
import { Job } from '@hokify/agenda';
import DailyRewardService, { DailyReward } from './DailyRewardService';
import DiscordDataProxy from '../proxies/DiscordDataProxy';
import PoolService from './PoolService';
import NotificationService from './NotificationService';
import PointBalanceService from './PointBalanceService';
import MilestoneRewardService from './MilestoneRewardService';
import PointRewardService from './PointRewardService';
import ReferralRewardService from './ReferralRewardService';
import QuestWeb3Service from './QuestWeb3Service';
import LockService from './LockService';
import QuestGitcoinService from './QuestGitcoinService';
import ImageService from './ImageService';
import SafeService from './SafeService';
import AccountProxy from '../proxies/AccountProxy';

function formatAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-3)}`;
}

const questMap: {
    [variant: number]: {
        models: { quest: any; entry: any };
        service: any;
    };
} = {
    [QuestVariant.Daily]: {
        models: { quest: DailyReward, entry: DailyRewardClaim },
        service: DailyRewardService,
    },
    [QuestVariant.Invite]: {
        models: { quest: ReferralReward, entry: ReferralRewardClaim },
        service: ReferralRewardService,
    },
    [QuestVariant.Twitter]: {
        models: { quest: PointReward, entry: PointRewardClaim },
        service: PointRewardService,
    },
    [QuestVariant.Discord]: {
        models: { quest: PointReward, entry: PointRewardClaim },
        service: PointRewardService,
    },
    [QuestVariant.YouTube]: {
        models: { quest: PointReward, entry: PointRewardClaim },
        service: PointRewardService,
    },
    [QuestVariant.Custom]: {
        models: { quest: MilestoneReward, entry: MilestoneRewardClaim },
        service: MilestoneRewardService,
    },
    [QuestVariant.Web3]: {
        models: { quest: Web3Quest, entry: Web3QuestClaim },
        service: QuestWeb3Service,
    },
    [QuestVariant.Gitcoin]: {
        models: { quest: GitcoinQuest, entry: GitcoinQuestEntry },
        service: QuestGitcoinService,
    },
};

async function list(pool: AssetPoolDocument, wallet?: WalletDocument) {
    const questVariants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
    const callback: any = async (variant: QuestVariant) => {
        const { service, models } = questMap[variant];
        const quests = await models.quest.find({
            poolId: pool._id,
            isPublished: true,
            variant,
            $or: [
                // Include quests with expiryDate less than or equal to now
                { expiryDate: { $exists: true, $gte: new Date() } },
                // Include quests with no expiryDate
                { expiryDate: { $exists: false } },
            ],
        });
        return await Promise.all(
            quests.map(async (quest: TQuest) => {
                try {
                    const isLocked = wallet ? await LockService.getIsLocked(quest.locks, wallet) : true;
                    const q = await service.findOne(quest, wallet);
                    return { ...q, isLocked };
                } catch (error) {
                    logger.error(error);
                }
            }),
        );
    };

    return await Promise.all(questVariants.map(callback));
}

async function update(variant: QuestVariant, questId: string, data: Partial<TQuest>, file?: Express.Multer.File) {
    const model = questMap[variant].models.quest;
    const quest = await model.findById(questId);

    if (file) {
        data.image = await ImageService.upload(file);
    }

    // We only want to notify when the quest is set to published (and not updated while published already)
    if (data.isPublished && Boolean(data.isPublished) !== quest.isPublished) {
        await NotificationService.notify(variant, { ...quest.toJSON(), ...data, image: data.image || quest.image });
    }

    return await model.findByIdAndUpdate(questId, data, { new: true });
}

async function create(variant: QuestVariant, poolId: string, data: Partial<TQuest>, file?: Express.Multer.File) {
    const model = questMap[variant].models.quest;
    const { interaction } = data as TPointReward;
    const platform = interaction && platformInteractionMap[interaction];
    const quest = await model.create({ ...data, platform, poolId, variant, uuid: v4() });

    if (file) {
        data.image = await ImageService.upload(file);
    }

    if (data.isPublished) {
        await NotificationService.notify(variant, quest);
    }

    return quest;
}

function findById(variant: QuestVariant, questId: string) {
    const model = questMap[variant].models.quest;
    return model.findById(questId);
}

async function findOne(variant: QuestVariant, questId: string, wallet: WalletDocument) {
    const quest = findById(variant, questId);
    const q = await questMap[variant].service.findOne(quest, wallet);
    const isLocked = wallet ? await LockService.getIsLocked(quest.locks, wallet) : false;
    return { ...q, isLocked };
}

function getAmount(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
    return questMap[variant].service.getAmount(quest, account, wallet);
}

function isAvailable(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
    return questMap[variant].service.isAvailable(quest, account, wallet);
}

function getValidationResult(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
    return questMap[variant].service.getValidationResult(quest, account, wallet);
}

async function sendQuestEntryNotification(
    pool: AssetPoolDocument,
    quest: TQuest,
    account: TAccount,
    wallet: TWallet,
    amount: number,
) {
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
}

async function complete(
    variant: QuestVariant,
    amount: number,
    pool: AssetPoolDocument,
    quest: TQuest,
    account: TAccount,
    wallet: WalletDocument,
    data: Partial<TQuestEntry>,
) {
    const { models } = questMap[variant];
    const available = await isAvailable(variant, quest, account, wallet);
    if (!available) throw new Error(`Quest entry exists already.`);

    await models.entry.create({
        sub: account.sub,
        walletId: wallet._id,
        amount,
        ...data,
        questId: String(quest._id),
        poolId: pool._id,
        uuid: v4(),
    });

    await PointBalanceService.add(pool, wallet._id, amount);
    await sendQuestEntryNotification(pool, quest, account, wallet, amount);
    await agenda.now(JobType.UpdateParticipantRanks, { poolId: pool._id });
}

async function createEntryJob(job: Job) {
    const { variant, questId, sub, data } = job.attrs.data as any;
    const quest = await findById(variant, questId);
    const account = await AccountProxy.getById(sub);
    const wallet = await SafeService.findPrimary(sub);
    const pool = await PoolService.getById(quest.poolId);
    const amount = await getAmount(variant, quest, account, wallet);

    await complete(variant, amount, pool, quest, account, wallet, {
        questId: quest._id,
        ...data,
    });
}

export { questMap };
export default { createEntryJob, findOne, list, getAmount, isAvailable, create, update, getValidationResult, findById };
