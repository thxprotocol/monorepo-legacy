import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId, WithdrawalState } from '@thxnetwork/api/types/enums';
import { Account } from 'web3-core';
import { toWei, isAddress } from 'web3-utils';
import { createWallet } from '@thxnetwork/api/util/jest/network';
import {
    rewardWithdrawAmount,
    rewardWithdrawDuration,
    rewardWithdrawUnlockDate,
    userWalletPrivateKey2,
    sub2,
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    MaxUint256,
    adminAccessToken,
    dashboardAccessToken,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getByteCodeForContractName, getContract, getContractFromName } from '@thxnetwork/api/config/contracts';
import { currentVersion } from '@thxnetwork/contracts/exports';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { RewardTokenDocument } from '@thxnetwork/api/models/RewardToken';

const user = request.agent(app);

describe('Default Pool', () => {
    const title = 'Welcome Package',
        slug = 'welcome-package';

    let poolAddress: string,
        tokenAddress: string,
        userWallet: Account,
        poolId: string,
        reward: RewardTokenDocument,
        claim: ClaimDocument;

    beforeAll(async () => {
        await beforeAllCallback();

        userWallet = createWallet(userWalletPrivateKey2);
    });

    afterAll(afterAllCallback);

    describe('Existing ERC20 contract', () => {
        it('TokenDeployed event', async () => {
            const { options } = getContract(ChainId.Hardhat, 'LimitedSupplyToken', currentVersion);
            const token = await TransactionService.deploy(
                options.jsonInterface,
                getByteCodeForContractName('LimitedSupplyToken'),
                [tokenName, tokenSymbol, userWallet.address, tokenTotalSupply],
                ChainId.Hardhat,
            );
            tokenAddress = token.options.address;
        });
    });

    describe('POST /pools', () => {
        it('HTTP 201 (success)', (done) => {
            user.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [tokenAddress],
                })
                .expect((res: request.Response) => {
                    poolId = res.body._id;
                    expect(res.body.archived).toBe(false);
                })
                .expect(201, done);
        });

        it('HTTP 201 (success)', (done) => {
            user.get(`/v1/pools/${poolId}`)
                .set('Authorization', dashboardAccessToken)
                .expect((res: request.Response) => {
                    expect(isAddress(res.body.address)).toBe(true);
                    poolAddress = res.body.address;
                })
                .expect(200, done);
        });
    });

    describe('POST /members/:address', () => {
        it('HTTP 200 when member is added', (done) => {
            user.post('/v1/members/')
                .send({ address: userWallet.address })
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(200, done);
        });
    });

    describe('Make deposit into pool', () => {
        it('Approve for infinite amount', async () => {
            const testToken = getContractFromName(ChainId.Hardhat, 'LimitedSupplyToken', tokenAddress);
            const tx = await testToken.methods.approve(poolAddress, MaxUint256).send({ from: userWallet.address });
            const event: any = Object.values(tx.events).filter((e: any) => e.event === 'Approval')[0];
            expect(event.returnValues.owner).toEqual(userWallet.address);
            expect(event.returnValues.spender).toEqual(poolAddress);
            expect(event.returnValues.value).toEqual(MaxUint256);
        });

        it('POST /deposits 201', async () => {
            await user
                .post('/v1/deposits')
                .set({ 'Authorization': walletAccessToken, 'X-PoolId': poolId })
                .send({ amount: tokenTotalSupply })
                .expect(200);
        });
    });

    describe('GET /pools/:address', () => {
        it('HTTP 200 and expose pool information', (done) => {
            user.get('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(async ({ body }: request.Response) => {
                    expect(body.address).toEqual(poolAddress);
                    expect(isAddress(body.erc20.address)).toEqual(true);
                    expect(body.erc20.totalSupply).toBe(tokenTotalSupply);
                    expect(Number(body.erc20.poolBalance)).toBe(
                        Number(tokenTotalSupply) - Number(tokenTotalSupply) * 0.025, // Total supply - 2.5% protocol fee on deposit
                    );
                })
                .expect(200, done);
        });
    });

    describe('POST /rewards-token/', () => {
        it('HTTP 302 when reward is added', (done) => {
            user.post('/v1/rewards-token/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title,
                    slug,
                    withdrawAmount: rewardWithdrawAmount,
                    withdrawDuration: rewardWithdrawDuration,
                    rewardWithdrawUnlockDate: rewardWithdrawUnlockDate,
                    amount: 1,
                })
                .expect(async (res: request.Response) => {
                    expect(res.body.id).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    reward = res.body;
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });
    });

    describe('GET /rewards-token/:id', () => {
        it('HTTP 200 when successful', (done) => {
            user.get('/v1/rewards-token/' + reward.id)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(200, done);
        });

        it('HTTP 404 if reward can not be found', (done) => {
            user.get('/v1/rewards-token/62cf04437dff7cbc49e0c687')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(404, done);
        });
    });

    describe('GET /rewards-token/:id (after finalizing)', () => {
        it('HTTP 200 and return updated withdrawAmount and state 1', (done) => {
            user.get('/v1/rewards-token/' + reward.id)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.rewardBase.state).toEqual(1);
                    expect(res.body.rewardBase.title).toEqual(title);
                    expect(res.body.rewardBase.slug).toEqual(slug);
                    expect(res.body.amount).toEqual(rewardWithdrawAmount);
                    expect(res.body.claims).toBeDefined();
                })
                .expect(200, done);
        });
    });

    describe('POST /rewards-token/:id/claim', () => {
        it('HTTP 302 when tx is handled', async () => {
            await user
                .post(`/v1/claims/${claim.id}/collect`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect(200);
        });

        it('HTTP 200 after return state Pending', (done) => {
            user.get('/v1/withdrawals?member=' + userWallet.address + '&page=1&limit=2')
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                .expect((res: request.Response) => {
                    const index = res.body.results.length - 1;
                    const withdrawal = res.body.results[index];
                    expect(withdrawal.state).toEqual(WithdrawalState.Withdrawn);
                    expect(withdrawal.amount).toEqual(rewardWithdrawAmount);
                    expect(withdrawal.unlockDate).not.toBe(undefined);
                })
                .expect(200, done);
        });
    });

    describe('POST /rewards-token/:id/give', () => {
        it('HTTP 200 when tx is handled', (done) => {
            user.post(`/v1/rewards-token/${reward.id}/give`)
                .send({
                    member: userWallet.address,
                })
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async ({ body }: request.Response) => {
                    expect(body._id).toBeDefined();
                    expect(body.sub).toEqual(sub2);
                    expect(body.amount).toEqual(rewardWithdrawAmount);
                    expect(body.state).toEqual(1);
                    expect(body.createdAt).toBeDefined();
                    expect(body.unlockDate).not.toBe(undefined);
                })
                .expect(200, done);
        });
    });

    describe('GET /pools/:address (after withdraw)', () => {
        it('HTTP 200 and have decreased balance', (done) => {
            user.get(`/v1/pools/${poolId}`)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(async (res: request.Response) => {
                    // Total supply - 2.5% = 250000 deposit fee  - 2.5% = 25 withdraw fee
                    expect(res.body.erc20.poolBalance).toBe(toWei('97497950'));
                })
                .expect(200, done);
        });
    });

    describe('GET /withdrawals (before proposed withdrawal)', () => {
        it('HTTP 200 and returns 2 items', (done) => {
            user.get(`/v1/withdrawals?member=${userWallet.address}&page=1&limit=2`)
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(2);
                })
                .expect(200, done);
        });
    });

    describe('GET /withdrawals for withdrawn state', () => {
        it('HTTP 200 and returns 2 items for state = 1', (done) => {
            user.get('/v1/withdrawals?state=1&page=1&limit=2')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(2);
                })
                .expect(200, done);
        });

        it('HTTP 200 and returns 0 item for state = 0', (done) => {
            user.get('/v1/withdrawals?state=0&page=1&limit=2')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(0);
                })
                .expect(200, done);
        });

        it('HTTP 200 and returns 0 items for state = 0 and rewardId = reward.id since rewardId 2 does not exist.', (done) => {
            user.get('/v1/withdrawals?state=0&rewardId=idontexist&page=1&limit=2')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(0);
                })
                .expect(200, done);
        });

        it('HTTP 200 and returns 1 item for state = 1 and rewardId = reward.id', (done) => {
            user.get(`/v1/withdrawals?state=1&rewardId=${reward.rewardBaseId}&page=1&limit=2`)
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(1);
                })
                .expect(200, done);
        });

        it('HTTP 200 and returns 1 item state = 1 and rewardId = reward.id and member address', (done) => {
            user.get(
                `/v1/withdrawals?member=${userWallet.address}&state=1&rewardId=${reward.rewardBaseId}&page=1&limit=2`,
            )
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(1);
                })
                .expect(200, done);
        });

        it('HTTP 200 and returns 0 items for unknown rewardId', (done) => {
            user.get('/v1/withdrawals?state=1&rewardId=idontexist&page=1&limit=2')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(0);
                })
                .expect(200, done);
        });

        it('HTTP 200 and returns 2 items for page=1 and limit=2', (done) => {
            user.get('/v1/withdrawals?page=1&limit=2')
                .set({ 'X-PoolId': poolId, 'Authorization': adminAccessToken })
                .expect(async (res: request.Response) => {
                    expect(res.body.results.length).toBe(2);
                    expect(res.body.previous).toBeUndefined();
                })
                .expect(200, done);
        });
    });

    describe('PATCH /pools/:id', () => {
        it('HTTP 200', (done) => {
            user.patch('/v1/pools/' + poolId)
                .set({ Authorization: dashboardAccessToken })
                .send({
                    archived: true,
                })
                .expect(({ body }: request.Response) => {
                    expect(body).toBeDefined();
                    expect(body.archived).toBe(true);
                })
                .expect(200, done);
        });
    });

    describe('DELETE /pools/:id', () => {
        it('HTTP 204', (done) => {
            user.delete('/v1/pools/' + poolId)
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect(204, done);
        });
    });
});
