import { Request, Response } from 'express';
import { param } from 'express-validator';
import { NotFoundError } from '@thxnetwork/api/util/errors';
import { JobType, QuestVariant } from '@thxnetwork/common/lib/types';
import { agenda } from '@thxnetwork/api/util/agenda';
import QuestService from '@thxnetwork/api/services/QuestService';
import { DailyReward } from '@thxnetwork/api/models/DailyReward';
import { logger } from '@thxnetwork/api/util/logger';
import bcrypt from 'bcrypt';

const validation = [param('id').isMongoId()];

const controller = async (req: Request, res: Response) => {
    const { params, account, wallet } = req;
    const quest = await DailyReward.findById(params.id);
    if (!quest) throw new NotFoundError('Could not find the Daily Reward');

    logger.info(`IP Forwarded For: ${req.header('x-forwarded-for')}`);
    logger.info(`IP: ${req.ip}`);

    // Only do this is no event requirement is set
    const ip = req.ip || req.header('x-forwarded-for');
    const ipHashed = await bcrypt.hash(ip, 10);

    const { result, reason } = await QuestService.getValidationResult(quest.variant, quest, account, wallet, {
        ipHashed,
    });
    if (!result) return res.json({ error: reason });

    const job = await agenda.now(JobType.CreateQuestEntry, {
        variant: QuestVariant.Daily,
        questId: String(quest._id),
        sub: account.sub,
        data: { ipHashed },
    });

    res.json({ jobId: job.attrs._id });
};

export default { controller, validation };
