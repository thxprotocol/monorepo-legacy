import { JobType, QuestVariant } from '@thxnetwork/types/enums';
import { TAccount, TQuest, TQuestEntry } from '@thxnetwork/types/interfaces';
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
    static async list(pool: AssetPoolDocument, wallet?: WalletDocument) {
        const questVariants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
        const callback: any = async (variant: QuestVariant) => {
            const service = serviceMap[variant];
            const quests = await service.list({ pool });
            return await Promise.all(
                quests.map(async (quest: TQuest) => {
                    try {
                        const isLocked = wallet ? await LockService.getIsLocked(quest.locks, wallet) : true;
                        const q = await service.decorate({ quest, wallet });
                        return { ...q, isLocked };
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

        return await serviceMap[variant].updateById(questId, data);
    }

    static async create(variant: QuestVariant, poolId: string, data: Partial<TQuest>, file?: Express.Multer.File) {
        const service = serviceMap[variant];
        const quest = await service.create({ ...data, poolId, variant, uuid: v4() });

        if (file) {
            data.image = await ImageService.upload(file);
        }

        if (data.isPublished) {
            await NotificationService.notify(variant, quest);
        }

        return quest;
    }

    static findById(variant: QuestVariant, questId: string) {
        return serviceMap[variant].findById(questId);
    }

    static async decorate(variant: QuestVariant, questId: string, wallet: WalletDocument) {
        const quest = await QuestService.findById(variant, questId);
        const q = await serviceMap[variant].decorate({ quest, wallet });
        const isLocked = wallet ? await LockService.getIsLocked(quest.locks, wallet) : false;
        return { ...q, isLocked };
    }

    static getAmount(variant: QuestVariant, quest: TQuest, account: TAccount, wallet: WalletDocument) {
        return serviceMap[variant].getAmount({ quest, account, wallet });
    }

    static isAvailable(
        variant: QuestVariant,
        options: { quest: TQuest; account: TAccount; wallet: WalletDocument; address?: string },
    ) {
        return serviceMap[variant].isAvailable(options);
    }

    static async getValidationResult(
        variant: QuestVariant,
        quest: TQuest,
        account: TAccount,
        wallet: WalletDocument,
        data: Partial<TQuestEntry & { rpc: string }>,
    ) {
        const isLocked = await LockService.getIsLocked(quest.locks, wallet);
        if (isLocked) return { result: false, reason: 'Quest is locked' };

        const isAvailable = await serviceMap[variant].isAvailable({ quest, account, wallet });
        if (!isAvailable) return { result: false, reason: 'Quest not available.' };

        return await serviceMap[variant].getValidationResult({ quest, account, wallet, data });
    }

    static async complete(
        variant: QuestVariant,
        amount: number,
        pool: AssetPoolDocument,
        quest: TQuest,
        account: TAccount,
        wallet: WalletDocument,
        data: Partial<TQuestEntry>,
    ) {
        const service = serviceMap[variant];
        const available = await this.isAvailable(variant, { quest, account, wallet });
        if (!available) throw new Error(`Quest entry exists already.`);

        const entry = {
            sub: account.sub,
            walletId: wallet._id,
            amount,
            ...data,
            questId: String(quest._id),
            poolId: pool._id,
            uuid: v4(),
        } as TQuestEntry;
        await service.createEntry(entry);

        await PointBalanceService.add(pool, wallet._id, amount);
        await NotificationService.sendQuestEntryNotification(pool, quest, account, wallet, amount);

        await agenda.now(JobType.UpdateParticipantRanks, { poolId: pool._id });
    }

    static async createEntryJob(job: Job) {
        const { variant, questId, sub, data } = job.attrs.data as any;
        const quest = await this.findById(variant, questId);
        const account = await AccountProxy.getById(sub);
        const wallet = await SafeService.findPrimary(sub);
        const pool = await PoolService.getById(quest.poolId);
        const { pointsAvailable } = await this.getAmount(variant, quest, account, wallet);

        await this.complete(variant, pointsAvailable, pool, quest, account, wallet, {
            questId: quest._id,
            ...data,
        });
    }
}
