import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { paginatedResults } from '../util/pagination';
import db from '@thxnetwork/api/util/database';
import { TSurveyReward } from '@thxnetwork/types/interfaces/SurveyReward';
import PoolService from './PoolService';
import { SurveyReward, SurveyRewardDocument } from '../models/SurveyReward';
import { SurveyRewardQuestion } from '../models/SurveyRewardQuestion';
import { TSurveyRewardQuestion } from '@thxnetwork/types/interfaces';
import { SurveyRewardClaim } from '../models/SurveyRewardClaim';
import { IAccount } from '../models/Account';
import { SurveyRewardAttemp } from '../models/SurveyRewardAttempt';
import { ONE_DAY_MS } from '../util/dates';
import { UnauthorizedError } from '../util/errors';

export function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(SurveyReward, page, limit, { poolId: pool._id });
}

export async function create(pool: AssetPoolDocument, payload: Partial<TSurveyReward>) {
    const reward = await SurveyReward.create({
        uuid: db.createUUID(),
        poolId: pool._id,
        amount: payload.amount,
    });
    const questions = payload.questions.map((q) => {
        return {
            surveyRewardId: reward._id,
            question: q.question,
            answers: q.answers,
        } as TSurveyRewardQuestion;
    });
    await SurveyRewardQuestion.create(questions);

    PoolService.sendNotification(pool, reward);

    return reward;
}

export async function update(reward: SurveyRewardDocument, payload: Partial<TSurveyReward>) {
    await SurveyReward.findByIdAndUpdate(reward._id, { ...payload });
    if (payload.questions.length) {
        await SurveyRewardQuestion.deleteMany({ surveyRewardId: reward._id });
        const questions = payload.questions.map((q) => {
            return {
                surveyRewardId: reward._id,
                question: q.question,
                answers: q.answers,
            } as TSurveyRewardQuestion;
        });
        await SurveyRewardQuestion.create(questions);
    }

    return await SurveyReward.findById(reward._id);
}

export async function remove(rewardId: string) {
    await SurveyRewardClaim.deleteMany({ surveyRewardId: rewardId });
    await SurveyRewardQuestion.deleteMany({ surveyRewardId: rewardId });
    await SurveyReward.findByIdAndDelete(rewardId);
}

export async function submitAttemp(
    account: IAccount,
    reward: SurveyRewardDocument,
    data: { surveyRewardQuestionId: string; answers: number[] }[],
) {
    let attemp = await SurveyRewardAttemp.findOne({ surveyRewardId: reward._id, sub: account.sub });
    if (attemp && Date.now() - attemp.updatedAt.getTime() < ONE_DAY_MS) {
        throw new UnauthorizedError('Can only submit one attemp in 24 hours');
    }

    let attempResult = null;
    for (const question of await reward.questions) {
        const correctAnswers = question.answers
            .filter((x) => x.correct)
            .map((x) => x.index)
            .sort();
        console.log('correctAnswers', correctAnswers);
        const attempAnswers = data.find((x) => x.surveyRewardQuestionId === question._id).answers.sort();
        attempResult =
            attempAnswers.length === correctAnswers.length &&
            correctAnswers.every((val, index) => val === attempAnswers[index]);
        if (!attempResult) {
            break;
        }
    }
    attemp = await SurveyRewardAttemp.findOneAndUpdate(
        { surveyRewardId: reward._id, sub: account.sub },
        { $set: { result: attempResult } },
        { upsert: true },
    );
    return attemp;
}

export default { findByPool, create, update, remove, submitAttemp };
