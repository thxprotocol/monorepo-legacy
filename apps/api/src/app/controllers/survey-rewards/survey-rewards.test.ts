import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import {
    dashboardAccessToken,
    sub,
    sub2,
    widgetAccessToken,
    widgetAccessToken2,
} from '@thxnetwork/api/util/jest/constants';

import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { SurveyRewardDocument } from '@thxnetwork/api/models/SurveyReward';

const user = request.agent(app);

describe('Survey Rewards', () => {
    let reward: SurveyRewardDocument, poolId: string;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
            })
            .expect((res: request.Response) => {
                expect(res.body.settings.isArchived).toBe(false);
                poolId = res.body._id;
            })
            .expect(201, done);
    });

    it('POST /survey-rewards', (done) => {
        const questions = [
            {
                question: 'Question 1',
                order: 1,
                answers: [
                    { value: 'Answer1', correct: true },
                    { value: 'Answer2', correct: false },
                    { value: 'Answer3', correct: false },
                ],
            },
            {
                question: 'Question 2',
                order: 2,
                answers: [
                    { value: 'Answer1', correct: false },
                    { value: 'Answer2', correct: false },
                    { value: 'Answer3', correct: false },
                ],
            },
            {
                question: 'Question 3',
                order: 3,
                answers: [
                    { value: 'Answer1', correct: true },
                    { value: 'Answer2', correct: true },
                    { value: 'Answer3', correct: true },
                ],
            },
        ];
        user.post(`/v1/survey-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Survey Reward 1',
                description: 'complete the survey correctly and earn points!',
                amount: 100,
                questions,
            })
            .expect(({ body }: request.Response) => {
                expect(body.uuid).toBeDefined();
                expect(body.amount).toBeDefined();
                expect(body.questions.length).toBe(3);
                expect(body.questions[0].question).toBe('Question 1');

                reward = body;
            })
            .expect(201, done);
    });

    it('GET /survey-rewards/:id', (done) => {
        user.get(`/v1/survey-rewards/${reward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.isClaimed).toBeDefined();
                expect(body.questions).toBeDefined();
                expect(body.questions.length).toBe(3);
                expect(body.questions[0].question).toBe('Question 1');
            })
            .expect(200, done);
    });

    it('GET /survey-rewards/', (done) => {
        user.get(`/v1/survey-rewards`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.results.length).toBe(1);
            })
            .expect(200, done);
    });

    it('POST /survey-rewards/:uuid/attemp  ATTEMP SHOULD FAIL for SUB2', (done) => {
        const selectedAnswers1 = [String(reward.questions[0].answers[0]._id)];
        const selectedAnswers2 = [];
        const selectedAnswers3 = [
            String(reward.questions[2].answers[1]._id),
            String(reward.questions[2].answers[1]._id),
            String(reward.questions[2].answers[2]._id),
        ];

        const attempData = [
            { surveyRewardQuestionId: reward.questions[0]._id, answers: selectedAnswers1 }, // uncorrect
            { surveyRewardQuestionId: reward.questions[1]._id, answers: selectedAnswers2 }, // correct
            { surveyRewardQuestionId: reward.questions[2]._id, answers: selectedAnswers3 }, // correct
        ];
        user.post(`/v1/survey-rewards/${reward.uuid}/attemp`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send({
                data: attempData,
            })
            .expect(({ body }: request.Response) => {
                expect(body.result).toBe(false);
                expect(body.sub).toBe(sub2);
                expect(body.surveyRewardId).toBe(reward._id);
            })
            .expect(201, done);
    });

    it('POST /survey-rewards/:uuid/attemp  SECOND ATTEMP SHOULD FAIL SINCE IS TOO SOON for SUB2', (done) => {
        const attempData = [
            { surveyRewardQuestionId: reward.questions[0]._id, answers: [0, 1] }, // uncorrect
            { surveyRewardQuestionId: reward.questions[1]._id, answers: [] }, // correct
            { surveyRewardQuestionId: reward.questions[2]._id, answers: [0, 1, 2] }, // correct
        ];
        user.post(`/v1/survey-rewards/${reward.uuid}/attemp`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken2 })
            .send({
                data: attempData,
            })
            .expect(({ body }: request.Response) => {
                expect(body.error.message).toBe('Can only attemp omce in 24 hours');
            })
            .expect(403, done);
    });

    it('POST /survey-rewards/:uuid/attemp  ATTEMP SHOULD SUCCED for SUB1', (done) => {
        const selectedAnswers1 = [String(reward.questions[0].answers[0]._id)];
        const selectedAnswers2 = [];
        const selectedAnswers3 = [
            String(reward.questions[2].answers[0]._id),
            String(reward.questions[2].answers[1]._id),
            String(reward.questions[2].answers[2]._id),
        ];

        const attempData = [
            { surveyRewardQuestionId: reward.questions[0]._id, answers: selectedAnswers1 }, // correct
            { surveyRewardQuestionId: reward.questions[1]._id, answers: selectedAnswers2 }, // correct
            { surveyRewardQuestionId: reward.questions[2]._id, answers: selectedAnswers3 }, // correct
        ];
        user.post(`/v1/survey-rewards/${reward.uuid}/attemp`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .send({
                data: attempData,
            })
            .expect(({ body }: request.Response) => {
                expect(body.result).toBe(true);
                expect(body.sub).toBe(sub);
                expect(body.surveyRewardId).toBe(reward._id);
            })
            .expect(201, done);
    });

    it('POST /rewards/survey/:uuid/claim  CLAIM SHOULD SUCCED for SUB1', (done) => {
        user.post(`/v1/rewards/survey/${reward.uuid}/claim`)
            .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
            .expect(({ body }: request.Response) => {
                expect(body.surveyRewardId).toBe(reward._id);
                expect(body.poolId).toBe(poolId);
                expect(body.sub).toBe(sub);
                expect(body.amount).toBe(reward.amount);
            })
            .expect(201, done);
    });

    it('PATCH /survey-rewards/:id', (done) => {
        const newQuestions = [reward.questions[0], reward.questions[2]];
        const newTitle = 'Survey Reward UPDATED';
        const newAmount = 5;
        user.patch(`/v1/survey-rewards/${reward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .send({
                title: newTitle,
                amount: newAmount,
                questions: newQuestions,
            })
            .expect(({ body }: request.Response) => {
                expect(body.title).toBe(newTitle);
                expect(body.amount).toBe(newAmount);
                expect(body.questions.length).toBe(newQuestions.length);
                reward = body;
            })
            .expect(200, done);
    });

    it('DELETE /survey-rewards/:id', (done) => {
        user.delete(`/v1/survey-rewards/${reward._id}`)
            .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
            .expect(204, done);
    });
});
