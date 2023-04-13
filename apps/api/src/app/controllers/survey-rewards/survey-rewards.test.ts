import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';

import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { addMinutes, subMinutes } from '@thxnetwork/api/util/rewards';

import { SurveyRewardDocument } from '@thxnetwork/api/models/SurveyReward';

const user = request.agent(app);

describe('Survey Rewards', () => {
    let reward: SurveyRewardDocument, poolId: string;
    const questions = [
        {
            question: 'Question 1',
            answers: [
                { index: 0, value: 'Answer1', correct: true },
                { index: 1, value: 'Answer2', correct: false },
                { index: 2, value: 'Answer3', correct: false },
            ],
        },
        {
            question: 'Question 2',
            answers: [
                { index: 0, value: 'Answer1', correct: false },
                { index: 1, value: 'Answer2', correct: false },
                { index: 2, value: 'Answer3', correct: false },
            ],
        },
        {
            question: 'Question 3',
            answers: [
                { index: 0, value: 'Answer1', correct: true },
                { index: 1, value: 'Answer2', correct: true },
                { index: 2, value: 'Answer3', correct: true },
            ],
        },
    ];

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
                expect(body.questions.length).toBe(questions.length);
                reward = body;
            })
            .expect(200, done);
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
