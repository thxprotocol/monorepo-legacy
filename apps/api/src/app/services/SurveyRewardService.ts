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
import { ForbiddenError } from '../util/errors';

export async function findByPool(pool: AssetPoolDocument, page = 1, limit = 5) {
    return paginatedResults(SurveyReward, page, limit, { poolId: pool._id });
}

export async function create(pool: AssetPoolDocument, payload: Partial<TSurveyReward>) {
    const reward = await SurveyReward.create({
        uuid: db.createUUID(),
        poolId: pool._id,
        title: payload.title,
        amount: payload.amount,
        description: payload.description,
    });
    const questions = payload.questions.map((q) => {
        return {
            surveyRewardId: reward._id,
            question: q.question,
            answers: q.answers,
            order: q.order,
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
    data: { surveyRewardQuestionId: string; answers: string[] }[],
) {
    let attemp = await SurveyRewardAttemp.findOne({ surveyRewardId: reward._id, sub: account.sub });
    if (attemp && Date.now() - attemp.updatedAt.getTime() < ONE_DAY_MS) {
        throw new ForbiddenError('Can only attemp omce in 24 hours');
    }
    let attempResult = null;
    if (data.length) {
        const questions = await reward.questions;
        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            // filter the ids of the correct answers
            const correctAnswers = question.answers.filter((x) => x.correct === true).map((x) => String(x._id));
            // check if the question is present in the attemp data
            const q = data.find((x) => x.surveyRewardQuestionId === String(question._id));
            if (!q) {
                break;
            }
            const attempAnswers = q.answers;
            // every answer submitted should be present in  the question correct answers list
            attempResult =
                attempAnswers.length === correctAnswers.length &&
                correctAnswers.every((val) => attempAnswers.includes(val));
            if (!attempResult) {
                break;
            }
        }
    }
    const attempId = attemp ? attemp._id : null;
    attemp = await SurveyRewardAttemp.findByIdAndUpdate(
        attempId,
        { $set: { surveyRewardId: reward._id, sub: account.sub, result: attempResult } },
        { upsert: true, new: true },
    );
    return attemp;
}

export default { findByPool, create, update, remove, submitAttemp };
