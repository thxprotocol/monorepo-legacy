import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/api/types/enums';
import {
    rewardWithdrawAmount,
    rewardWithdrawDuration,
    rewardWithdrawUnlockDate,
    requestUris,
    redirectUris,
    postLogoutRedirectUris,
    dashboardAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { Contract } from 'web3-eth-contract';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getContract } from '@thxnetwork/api/config/contracts';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { RewardDocument } from '@thxnetwork/api/models/Reward';

const user = request.agent(app);

describe('Widgets', () => {
    const title = 'Welcome Package',
        slug = 'welcome-package';

    let pool: AssetPoolDocument, testToken: Contract, clientId: string, reward: RewardDocument;

    beforeAll(async () => {
        await beforeAllCallback();

        testToken = getContract(ChainId.Hardhat, 'LimitedSupplyToken');
    });

    afterAll(afterAllCallback);

    describe('POST /pools', () => {
        it('HTTP 200', (done) => {
            user.post('/v1/pools')
                .set({ Authorization: dashboardAccessToken })
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [testToken.options.address],
                })
                .expect(({ body }: request.Response) => {
                    pool = body;
                })
                .expect(201, done);
        });
    });

    describe('POST /rewards', () => {
        it('HTTP 200', async () => {
            await user
                .post('/v1/erc20-rewards/')
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .send({
                    title,
                    slug,
                    withdrawAmount: rewardWithdrawAmount,
                    withdrawDuration: rewardWithdrawDuration,
                    withdrawUnlockDate: rewardWithdrawUnlockDate,
                    amount: 1,
                })
                .expect(({ body }: request.Response) => {
                    reward = body;
                })
                .expect(201);
        });
    });

    describe('POST /widgets/', () => {
        it('HTTP 200', (done) => {
            user.post('/v1/widgets/')
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .send({
                    metadata: {
                        rewardId: reward.id,
                        poolId: pool._id,
                    },
                    requestUris,
                    redirectUris,
                    postLogoutRedirectUris,
                })
                .expect(201, done);
        });
    });

    describe('GET /widgets', () => {
        it('HTTP 200', (done) => {
            user.get('/v1/widgets?poolId=' + pool._id)
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.length).toBe(1);
                    clientId = res.body[0];
                })
                .expect(200, done);
        });
    });

    describe('GET /widgets/:clientId', () => {
        it('HTTP 200', (done) => {
            user.get('/v1/widgets/' + clientId)
                .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.requestUris[0]).toBe(requestUris[0]);
                    expect(res.body.clientId).toBeDefined();
                    expect(res.body.clientSecret).toBeDefined();
                    expect(res.body.metadata.rewardId).toBe(reward.id);
                    expect(res.body.metadata.poolId).toBe(pool._id);
                })
                .expect(200, done);
        });
    });
});
