import { JobType, QuestSocialRequirement, QuestVariant } from '@thxnetwork/common/enums';
import { PoolDocument, Participant } from '@thxnetwork/api/models';
import { v4 } from 'uuid';
import { agenda } from '../util/agenda';
import { logger } from '../util/logger';
import { Job } from '@hokify/agenda';
import { serviceMap } from './interfaces/IQuestService';
import { tokenInteractionMap } from './maps/quests';
import { NODE_ENV } from '../config/secrets';
import PoolService from './PoolService';
import NotificationService from './NotificationService';
import PointBalanceService from './PointBalanceService';
import LockService from './LockService';
import ImageService from './ImageService';
import AccountProxy from '../proxies/AccountProxy';
import ParticipantService from './ParticipantService';
import THXService from './THXService';

export default class QuestService {
    static async count({ poolId }) {
        const variants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
        const counts = await Promise.all(
            variants.map(async (variant: string) => {
                const Quest = serviceMap[variant].models.quest;
                return await Quest.countDocuments({ poolId, isPublished: true });
            }),
        );
        return counts.reduce((acc, count) => acc + count, 0);
    }

    static async list({ pool, data, account }: { pool: PoolDocument; data: Partial<TQuestEntry>; account?: TAccount }) {
        const questVariants = Object.keys(QuestVariant).filter((v) => !isNaN(Number(v)));
        const author = await AccountProxy.findById(pool.sub);
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
                        const decorated = await serviceMap[variant].decorate({ quest, account, data });
                        const isLocked = await LockService.getIsLocked(quest.locks, account);
                        const isExpired = this.isExpired(quest);
                        const QuestEntry = serviceMap[variant].models.entry;
                        const distinctSubs = await QuestEntry.countDocuments({ questId: q.id }).distinct('sub');
                        return {
                            ...decorated,
                            entryCount: distinctSubs.length,
                            author: { username: author.username },
                            isLocked,
                            isExpired,
                        };
                    } catch (error) {
                        logger.error(error);
                    }
                }),
            );
        };

        return await Promise.all(questVariants.map(callback));
    }

    static async update(quest: TQuest, updates: Partial<TQuest>, file?: Express.Multer.File) {
        if (file) {
            updates.image = await ImageService.upload(file);
        }

        // We only want to notify when the quest is set to published (and not updated while published already)
        if (updates.isPublished && Boolean(updates.isPublished) !== quest.isPublished) {
            await NotificationService.notify(quest.variant, {
                ...quest,
                ...updates,
                image: updates.image || quest.image,
            });
        }

        return await this.updateById(quest.variant, quest._id, updates);
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

    static getAmount(variant: QuestVariant, quest: TQuest, account: TAccount) {
        return serviceMap[variant].getAmount({ quest, account });
    }

    static isExpired(quest: TQuest) {
        return quest.expiryDate ? new Date(quest.expiryDate).getTime() < Date.now() : false;
    }

    static async isAvailable(
        variant: QuestVariant,
        options: {
            quest: TQuest;
            account?: TAccount;
            data: Partial<TQuestEntry & { rpc: string }>;
        },
    ): Promise<TValidationResult> {
        if (!options.quest.isPublished) {
            return { result: false, reason: 'Quest has not been published.' };
        }

        const isExpired = this.isExpired(options.quest);
        if (isExpired) return { result: false, reason: 'Quest has expired.' };

        const isLocked = await LockService.getIsLocked(options.quest.locks, options.account);
        if (isLocked) return { result: false, reason: 'Quest is locked.' };

        return await serviceMap[variant].isAvailable(options);
    }

    static async isRealUser(
        variant: QuestVariant,
        options: { quest: TQuest; account: TAccount; data: Partial<TQuestEntry & { recaptcha: string }> },
    ) {
        // Skip recaptcha check in test environment
        if (NODE_ENV === 'test') return { result: true, reasons: '' };

        // Define the recaptcha action for this quest variant
        const recaptchaAction = `QUEST_${QuestVariant[variant].toUpperCase()}_ENTRY_CREATE`;

        // Update the participant's risk score
        const { riskAnalysis } = await ParticipantService.updateRiskScore(options.account, options.quest.poolId, {
            token: options.data.recaptcha,
            recaptchaAction,
        });

        logger.info(
            'ReCaptcha result' +
                JSON.stringify({
                    sub: options.account.sub,
                    poolId: options.quest.poolId,
                    riskAnalysis,
                    recaptchaAction,
                }),
        );

        // Defaults: 0.1, 0.3, 0.7 and 0.9. Ranges from 0 (Bot) to 1 (User)
        if (riskAnalysis.score >= 0.9) {
            return { result: true, reasons: '' };
        }

        return { result: false, reason: 'This request has been indentified as potentially automated.' };
    }

    static async getValidationResult(
        variant: QuestVariant,
        options: {
            quest: TQuest;
            account: TAccount;
            data: Partial<TQuestEntry>;
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
            const quest = await this.findById(variant, questId);
            const pool = await PoolService.getById(quest.poolId);
            const amount = await this.getAmount(variant, quest, account);

            // Test availabily of quest once more as it could be completed by a job that was scheduled already
            // if the jobs were created in parallel.
            const isAvailable = await this.isAvailable(variant, { quest, account, data });
            if (!isAvailable.result) throw new Error(isAvailable.reason);

            // Create the quest entry
            const entry = await Entry.create({
                ...data,
                sub: account.sub,
                amount,
                questId: String(quest._id),
                poolId: pool._id,
                uuid: v4(),
            } as TQuestEntry);
            if (!entry) throw new Error('Entry creation failed.');

            // Should make sure quest entry is properly created
            await PointBalanceService.add(pool, account, amount);
            await NotificationService.sendQuestEntryNotification(pool, quest, account, amount);

            // Register THX onboarding campaign event
            await THXService.createEvent(account, 'quest_entry_created');

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

    static async findEntries(quest: TQuest, { page = 1, limit = 25 }: { page: number; limit: number }) {
        const skip = (page - 1) * limit;
        const Entry = serviceMap[quest.variant].models.entry;
        const total = await Entry.countDocuments({ questId: quest._id });
        const entries = await Entry.find({ questId: quest._id }).limit(limit).skip(skip);
        const subs = entries.map((entry) => entry.sub);
        const accounts = await AccountProxy.find({ subs });
        const participants = await Participant.find({ poolId: quest.poolId });
        const promises = entries.map(async (entry) => ParticipantService.decorate(entry, { accounts, participants }));
        const results = await Promise.allSettled(promises);
        const meta = await serviceMap[quest.variant].findEntryMetadata({ quest });

        return {
            total,
            limit,
            page,
            meta,
            results: results.filter((result) => result.status === 'fulfilled').map((result: any) => result.value),
        };
    }
}
