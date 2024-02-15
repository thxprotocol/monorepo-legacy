import { JobType, QuestSocialRequirement, QuestVariant } from '@thxnetwork/types/enums';
import { TAccount, TQuest, TQuestEntry, TToken, TValidationResult } from '@thxnetwork/types/interfaces';
import { v4 } from 'uuid';
import { AssetPoolDocument } from '../models/AssetPool';
import { agenda } from '../util/agenda';
import { WalletDocument } from '../models/Wallet';
import { logger } from '../util/logger';
import { Job } from '@hokify/agenda';
import { serviceMap } from './interfaces/IQuestService';

import PoolService from './PoolService';
import NotificationService from './NotificationService';
import PointBalanceService from './PointBalanceService';
import LockService from './LockService';
import ImageService from './ImageService';
import SafeService, { Wallet } from './SafeService';
import AccountProxy from '../proxies/AccountProxy';
import { tokenInteractionMap } from './maps/quests';
import { TwitterUser } from '../models/TwitterUser';
import { Participant } from '../models/Participant';

export default class QuestService {
    static async list({
        pool,
        data,
        wallet,
        account,
    }: {
        pool: AssetPoolDocument;
        data: Partial<TQuestEntry>;
        wallet?: WalletDocument;
        account?: TAccount;
    }) {
        const questVariants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
        const callback: any = async (variant: QuestVariant) => {
            const Quest = serviceMap[variant].models.quest;
            const quests = await Quest.find({
                poolId: pool._id,
                variant,
                isPublished: true,
                $or: [
                    // Include quests with expiryDate less than or equal to now
                    { expiryDate: { $exists: true, $gte: new Date() } },
                    // Include quests with no expiryDate
                    { expiryDate: { $exists: false } },
                ],
            });

            return await Promise.all(
                quests.map(async (q) => {
                    try {
                        const quest = q.toJSON() as TQuest;
                        const decorated = await serviceMap[variant].decorate({ quest, wallet, account, data });
                        const isLocked = await LockService.getIsLocked(quest.locks, wallet);
                        const isExpired = this.isExpired(quest);
                        return { ...decorated, isLocked, isExpired };
                    } catch (error) {
                        logger.error(error);
                    }
                }),
            );
        };

        return await Promise.all(questVariants.map(callback));
    }

    static async update(variant: QuestVariant, questId: string, data: Partial<TQuest>, file?: Express.Multer.File) {
        const quest = await this.findById(variant, questId);

        if (file) {
            data.image = await ImageService.upload(file);
            data.image = await ImageService.upload(file);
        }

        // We only want to notify when the quest is set to published (and not updated while published already)
        if (data.isPublished && Boolean(data.isPublished) !== quest.isPublished) {
            await NotificationService.notify(variant, { ...quest, ...data, image: data.image || quest.image });
        }

        return await this.updateById(variant, questId, data);
    }

    static async create(variant: QuestVariant, poolId: string, data: Partial<TQuest>, file?: Express.Multer.File) {
        if (file) {
            data.image = await ImageService.upload(file);
        }

        const Quest = serviceMap[variant].models.quest;
        const quest = await Quest.create({ ...data, poolId, variant, uuid: v4() });

        if (data.isPublished) {
            await NotificationService.notify(variant, quest);
        }

        return quest;
    }

    static findById(variant: QuestVariant, questId: string) {
        const Quest = serviceMap[variant].models.quest;
        return Quest.findById(questId);
    }

    static updateById(variant: QuestVariant, questId: string, options: Partial<TQuest>) {
        const Quest = serviceMap[variant].models.quest;
        return Quest.findByIdAndUpdate(questId, options, { new: true });
    }

    static getAmount(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
        return serviceMap[variant].getAmount({ quest, account, wallet });
    }

    static isExpired(quest: TQuest) {
        return quest.expiryDate ? new Date(quest.expiryDate).getTime() < Date.now() : false;
    }

    static async isAvailable(
        variant: QuestVariant,
        options: {
            quest: TQuest;
            wallet?: WalletDocument;
            account?: TAccount;
            data: Partial<TQuestEntry & { rpc: string }>;
        },
    ): Promise<TValidationResult> {
        if (!options.quest.isPublished) {
            return { result: false, reason: 'Quest has not been published.' };
        }

        const isExpired = this.isExpired(options.quest);
        if (isExpired) return { result: false, reason: 'Quest has expired.' };

        const isLocked = await LockService.getIsLocked(options.quest.locks, options.wallet);
        if (isLocked) return { result: false, reason: 'Quest is locked.' };

        return await serviceMap[variant].isAvailable(options);
    }

    static async getValidationResult(
        variant: QuestVariant,
        options: {
            quest: TQuest;
            account: TAccount;
            wallet: WalletDocument;
            data: Partial<TQuestEntry & { rpc: string }>;
        },
    ) {
        const isAvailable = await this.isAvailable(variant, options);
        if (!isAvailable.result) return isAvailable;

        return await serviceMap[variant].getValidationResult(options);
    }

    static async createEntryJob(job: Job) {
        try {
            const { variant, questId, sub, data } = job.attrs.data as any;
            const Entry = serviceMap[Number(variant)].models.entry;
            const account = await AccountProxy.findById(sub);
            const wallet = await SafeService.findPrimary(sub);
            const quest = await this.findById(variant, questId);
            const pool = await PoolService.getById(quest.poolId);
            const amount = await this.getAmount(variant, quest, account, wallet);

            // Test availabily of quest once more as it could be completed by a job that was scheduled already
            // if the jobs were created in parallel.
            const isAvailable = await this.isAvailable(variant, { quest, account, wallet, data });
            if (!isAvailable.result) throw new Error(isAvailable.reason);

            // Create the quest entry
            const entry = await Entry.create({
                ...data,
                sub: account.sub,
                amount,
                walletId: wallet._id,
                questId: String(quest._id),
                poolId: pool._id,
                uuid: v4(),
            } as TQuestEntry);
            if (!entry) throw new Error('Entry creation failed.');

            // Should make sure quest entry is properly created
            await PointBalanceService.add(pool, account, amount);
            await NotificationService.sendQuestEntryNotification(pool, quest, account, wallet, amount);

            // Update participant ranks async
            agenda.now(JobType.UpdateParticipantRanks, { poolId: pool._id });
        } catch (error) {
            logger.error(error);
        }
    }

    static findUserIdForInteraction(account: TAccount, interaction: QuestSocialRequirement) {
        if (typeof interaction === 'undefined') return;
        const { kind } = tokenInteractionMap[interaction];
        const token = account.tokens.find((token) => token.kind === kind);

        return token && token.userId;
    }

    static async findEntries(
        variant: QuestVariant,
        { quest, page = 1, limit = 25 }: { quest: TQuest; page: number; limit: number },
    ) {
        const skip = (page - 1) * limit;
        const Entry = serviceMap[variant].models.entry;
        const total = await Entry.countDocuments({ questId: quest._id });
        const entries = await Entry.find({ questId: quest._id }).limit(limit).skip(skip);
        const subs = entries.map((entry) => entry.sub);
        const accounts = await AccountProxy.find({ subs });
        const participants = await Participant.find({ poolId: quest.poolId });
        const promises = entries.map(async (entry) => {
            const account = accounts.find((a) => a.sub === entry.sub);
            const pointBalance = participants.find((p) => account.sub === String(p.sub));
            const tokens = await Promise.all(
                account.tokens.map(async (token: TToken) => {
                    if (token.kind !== 'twitter') return token;
                    const user = await TwitterUser.findOne({ userId: token.userId });
                    return { ...token, user };
                }),
            );
            return {
                ...entry.toJSON(),
                account: { ...account, tokens },
                pointBalance: pointBalance ? pointBalance.balance : 0,
            };
        });
        const results = await Promise.allSettled(promises);
        const meta = await serviceMap[variant].findEntryMetadata({ quest });

        return {
            total,
            limit,
            page,
            meta,
            results: results.filter((result) => result.status === 'fulfilled').map((result: any) => result.value),
        };
    }
}
