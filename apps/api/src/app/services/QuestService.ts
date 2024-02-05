import { JobType, QuestVariant } from '@thxnetwork/types/enums';
import { TAccount, TQuest, TQuestEntry, TValidationResult } from '@thxnetwork/types/interfaces';
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
import SafeService from './SafeService';
import AccountProxy from '../proxies/AccountProxy';

export default class QuestService {
    static async list(pool: AssetPoolDocument, wallet?: WalletDocument, account?: TAccount) {
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
                quests.map((q) => {
                    try {
                        const quest = q.toJSON() as TQuest;
                        return serviceMap[variant].decorate({ quest, wallet, account });
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

    static async decorate(variant: QuestVariant, questId: string, wallet: WalletDocument) {
        const quest = await QuestService.findById(variant, questId);
        const q = await serviceMap[variant].decorate({ quest, wallet });
        const isLocked = wallet ? await LockService.getIsLocked(quest.locks, wallet) : false;
        const isExpired = this.isExpired(quest);
        return { ...q, isExpired, isLocked };
    }

    static getAmount(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
        return serviceMap[variant].getAmount({ quest, account, wallet });
    }

    static isExpired(quest: TQuest) {
        return quest.expiryDate ? new Date(quest.expiryDate).getTime() < Date.now() : false;
    }

    static async isAvailable(
        variant: QuestVariant,
        options: { quest: TQuest; account: TAccount; wallet: WalletDocument; address?: string },
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
        quest: TQuest,
        account: TAccount,
        wallet: WalletDocument,
        data: Partial<TQuestEntry & { rpc: string }>,
    ) {
        const isAvailable = await serviceMap[variant].isAvailable({ quest, account, wallet });
        if (!isAvailable) return { result: false, reason: 'Quest is not available.' };

        return await serviceMap[variant].getValidationResult({ quest, account, wallet, data });
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
            const available = await this.isAvailable(variant, { quest, account, wallet });
            if (!available) throw new Error(`Quest entry exists already.`);

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
            await PointBalanceService.add(pool, wallet._id, amount);
            await NotificationService.sendQuestEntryNotification(pool, quest, account, wallet, amount);

            // Update participant ranks async
            agenda.now(JobType.UpdateParticipantRanks, { poolId: pool._id });
        } catch (error) {
            logger.error(error);
        }
    }
}
