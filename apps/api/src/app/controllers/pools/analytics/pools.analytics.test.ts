import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import { Account } from 'web3-core';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import {
    userWalletPrivateKey2,
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    dashboardAccessToken,
    sub2,
    widgetAccessToken,
    userWalletAddress2,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getByteCodeForContractName, getContract } from '@thxnetwork/api/config/contracts';
import { currentVersion } from '@thxnetwork/contracts/exports';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { addMinutes } from '@thxnetwork/api/util/rewards';
import { Contract } from 'web3-eth-contract';

const user = request.agent(app);

describe('Default Pool', () => {
    let pointReward: any,
        referralRewardId: string,
        referralReward: any,
        referralRewardClaim: any,
        milestoneReward: any,
        milestoneRewardClaim: any,
        perk: any,
        perkUuid: string,
        erc20Id: string,
        userWallet: Account,
        poolId: string,
        tokenContract: Contract;

    let sub1TotalAmount = 0;
    let sub2TotalAmount = 0;

    beforeAll(async () => {
        await beforeAllCallback();

        userWallet = createWallet(userWalletPrivateKey2);
    });

    afterAll(afterAllCallback);

    describe('Existing ERC20 contract', () => {
        it('TokenDeployed event', async () => {
            const { options } = getContract(ChainId.Hardhat, 'LimitedSupplyToken', currentVersion);
            tokenContract = await TransactionService.deploy(
                options.jsonInterface,
                getByteCodeForContractName('LimitedSupplyToken'),
                [tokenName, tokenSymbol, userWallet.address, tokenTotalSupply],
                ChainId.Hardhat,
            );
        });
        it('import token', (done) => {
            user.post('/v1/erc20/token')
                .set('Authorization', dashboardAccessToken)
                .send({
                    address: tokenContract.options.address,
                    chainId: ChainId.Hardhat,
                })
                .expect(({ body }: request.Response) => {
                    erc20Id = body._id;
                })
                .expect(201, done);
        });
    });

    describe('Pool Analytics', () => {
        it('POST /pools', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    title: 'My Pool',
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                    expect(res.body.title).toBe('My Pool');
                    expect(res.body.archived).toBe(false);
                })
                .expect(201, done);
        });
        describe('Create 2 Referral Rewards, claim and approve', () => {
            it('POST /referral-rewards', (done) => {
                const expiryDate = addMinutes(new Date(), 30);
                const successUrl = 'http://www.google.com';
                user.post('/v1/referral-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title: 'Referral Reward 1',
                        amount: 100,
                        platform: 0,
                        expiryDate,
                        rewardLimit: 0,
                        claimAmount: 1,
                        successUrl,
                    })
                    .expect((res: request.Response) => {
                        referralRewardId = res.body._id;
                        referralReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /referral-rewards/:uuid/claims', (done) => {
                user.post(`/v1/referral-rewards/${referralRewardId}/claims`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        sub: sub2,
                    })
                    .expect((res: request.Response) => {
                        referralRewardClaim = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /referral-rewards/:uuid/claims/approve', (done) => {
                user.post(`/v1/referral-rewards/${referralReward.uuid}/claims/approve`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        claimUuids: [referralRewardClaim.uuid],
                    })
                    .expect((res: request.Response) => {
                        referralRewardClaim = res.body[0];
                        sub1TotalAmount += referralReward.amount;
                    })
                    .expect(200, done);
            });

            it('POST /referral-rewards', (done) => {
                const expiryDate = addMinutes(new Date(), 30);
                const successUrl = 'http://www.google.com';
                user.post('/v1/referral-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title: 'Referral Reward 2',
                        amount: 50,
                        platform: 0,
                        expiryDate,
                        rewardLimit: 0,
                        claimAmount: 1,
                        successUrl,
                    })
                    .expect((res: request.Response) => {
                        referralRewardId = res.body._id;
                        referralReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /referral-rewards/:uuid/claims', (done) => {
                user.post(`/v1/referral-rewards/${referralRewardId}/claims`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        sub: sub2,
                    })
                    .expect((res: request.Response) => {
                        referralRewardClaim = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /referral-rewards/:uuid/claims/approve', (done) => {
                user.post(`/v1/referral-rewards/${referralReward.uuid}/claims/approve`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        claimUuids: [referralRewardClaim.uuid],
                    })
                    .expect((res: request.Response) => {
                        referralRewardClaim = res.body[0];
                        sub1TotalAmount += referralReward.amount;
                    })
                    .expect(200, done);
            });
        });

        describe('Create 2 Points Rewards and claim', () => {
            it('POST /point-rewards', (done) => {
                const expiryDate = addMinutes(new Date(), 30);
                const title = 'Point Reward 1';
                const description = 'description';
                const amount = '10';
                user.post('/v1/point-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title,
                        description,
                        amount,
                        platform: 0,
                        expiryDate,
                        rewardLimit: 1,
                        claimAmount: 1,
                    })
                    .expect((res: request.Response) => {
                        pointReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /rewards/points/:uuid/claim', (done) => {
                user.post(`/v1/rewards/points/${pointReward.uuid}/claim`)
                    .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                    .expect((res: request.Response) => {
                        referralRewardClaim = res.body[0];
                        sub2TotalAmount += Number(pointReward.amount);
                    })
                    .expect(201, done);
            });

            it('POST /point-rewards', (done) => {
                const expiryDate = addMinutes(new Date(), 30);
                const title = 'Point Reward 2';
                const description = 'description';
                const amount = '20';
                user.post('/v1/point-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title,
                        description,
                        amount,
                        platform: 0,
                        expiryDate,
                        rewardLimit: 1,
                        claimAmount: 1,
                    })
                    .expect((res: request.Response) => {
                        pointReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /rewards/points/:uuid/claim', (done) => {
                user.post(`/v1/rewards/points/${pointReward.uuid}/claim`)
                    .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                    .expect((res: request.Response) => {
                        referralRewardClaim = res.body[0];
                        sub2TotalAmount += Number(pointReward.amount);
                    })
                    .expect(201, done);
            });
        });

        describe('Create 1 Milestone, claim and collect', () => {
            it('POST /milestone-rewards', (done) => {
                user.post('/v1/milestone-rewards/')
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .send({
                        title: 'Expiration date is next 30 min',
                        description: 'Lorem ipsum dolor sit amet',
                        amount: 1000,
                    })
                    .expect((res: request.Response) => {
                        milestoneReward = res.body;
                    })
                    .expect(201, done);
            });

            it('POST /webhook/milestone/:token/claim', (done) => {
                user.post(`/v1/webhook/milestone/${milestoneReward.uuid}/claim`)
                    .send({
                        address: userWalletAddress2,
                    })
                    .expect((res: request.Response) => {
                        expect(res.body.milestoneRewardId).toBe(milestoneReward._id);
                        expect(res.body.uuid).toBeDefined();
                        milestoneRewardClaim = res.body;
                        sub1TotalAmount += milestoneReward.amount;
                    })
                    .expect(201, done);
            });

            it('POST /milestones/claims/:uuid/collect', (done) => {
                user.post(`/v1/rewards/milestones/claims/${milestoneRewardClaim.uuid}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': widgetAccessToken })
                    .send({
                        address: userWalletAddress2,
                    })
                    .expect((res: request.Response) => {
                        expect(res.body.isClaimed).toBe(true);
                    })
                    .expect(201, done);
            });
        });
        describe('Generate Analitycs', () => {
            it('GET /pools/:id/analytics', (done) => {
                const oneDay = 86400000; // one day in milliseconds
                const endDate = new Date();

                endDate.setHours(0, 0, 0, 0);
                const startDate = new Date(new Date(endDate).getTime() - oneDay * 14);
                endDate.setHours(23, 59, 59, 0);

                user.get(`/v1/pools/${poolId}/analytics?startDate=${startDate}&endDate=${endDate}`)
                    .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                    .expect(({ body }: request.Response) => {
                        expect(body.referralRewards.length).toBe(1);
                        expect(body.referralRewards[0].totalClaimPoints).toBe(150);
                        expect(body.pointRewards.length).toBe(1);
                        expect(body.pointRewards[0].totalClaimPoints).toBe(30);
                        expect(body.milestoneRewards.length).toBe(1);
                        expect(body.milestoneRewards[0].totalClaimPoints).toBe(1000);
                        expect(body.leaderBoard.length).toBe(2);
                        expect(body.leaderBoard[0].score).toBe(sub1TotalAmount);
                        expect(body.leaderBoard[1].score).toBe(sub2TotalAmount);
                    })

                    .expect(200, done);
            });
        });
    });
});
