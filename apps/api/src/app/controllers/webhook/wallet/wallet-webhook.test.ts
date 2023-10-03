import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '@thxnetwork/types/enums';
import {
    dashboardAccessToken,
    sub3,
    userWalletPrivateKey3,
    widgetAccessToken3,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { AssetPoolDocument } from '@thxnetwork/api/models/AssetPool';
import { validate } from 'uuid';
import { MilestoneRewardDocument } from '@thxnetwork/api/models/MilestoneReward';
import { Wallet } from 'ethers';
import { userWalletAddress3 } from '@thxnetwork/api/util/jest/constants';

const user = request.agent(app);

describe('Webhook: Virtual Wallets', () => {
    let safeAddress: string, pool: AssetPoolDocument, milestoneReward: MilestoneRewardDocument;

    beforeAll(() => beforeAllCallback({ skipWalletCreation: true }));
    afterAll(afterAllCallback);

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({ chainId: ChainId.Hardhat })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                pool = res.body;
            })
            .expect(201, done);
    });

    it('POST /milestone-rewards', (done) => {
        user.post('/v1/milestone-rewards/')
            .set({ 'X-PoolId': pool._id, 'Authorization': dashboardAccessToken })
            .send({
                title: 'Expiration date is next 30 min',
                description: 'Lorem ipsum dolor sit amet',
                amount: 100,
                index: 0,
                isPublished: true,
            })
            .expect((res: request.Response) => {
                expect(res.body.uuid).toBeDefined();
                expect(res.body.amount).toBe(100);
                milestoneReward = res.body;
            })
            .expect(201, done);
    });

    // Update account address with MPC wallet address
    it('PATCH /account (address)', async () => {
        const authRequestMessage = 'test';
        const authRequestSignature = await (async () => {
            const wallet = new Wallet(userWalletPrivateKey3);
            return await wallet.signMessage(authRequestMessage);
        })();
        const res = await user
            .patch(`/v1/account`)
            .set({ Authorization: widgetAccessToken3 })
            .send({ authRequestMessage, authRequestSignature });
        expect(res.body.address).toBe(userWalletAddress3);
    });

    describe('Wallet onboarding', () => {
        let wallet, code;

        // Onboard a new wallet
        it('POST /webhook/wallet/:token', (done) => {
            user.post('/v1/webhook/wallet/' + pool.token)
                .send()
                .expect((res: request.Response) => {
                    expect(validate(res.body.code)).toEqual(true);
                    code = res.body.code;
                })
                .expect(201, done);
        });

        // Claim a milestone reward for a wallet code
        it('POST /webhook/milestone/:token/claim', (done) => {
            user.post(`/v1/webhook/milestone/${milestoneReward.uuid}/claim`)
                .send({ code })
                .expect((res: request.Response) => {
                    expect(res.body.uuid).toBeDefined();
                    expect(res.body.milestoneRewardId).toBe(milestoneReward._id);
                    expect(res.body.wallet.address).toBe('');
                    expect(res.body.wallet.uuid).toBe(code);
                    expect(res.body.wallet.sub).toBeUndefined();
                    wallet = res.body.wallet;
                })
                .expect(201, done);
        });

        // Get onboarded wallet details for code
        it('GET /webhook/wallet/:code', (done) => {
            user.get('/v1/webhook/wallet/' + code)
                .send()
                .expect((res: request.Response) => {
                    expect(res.body.wallet._id).toBe(wallet._id);
                    expect(res.body.wallet.address).toBe('');
                    expect(res.body.wallet.uuid).toBe(code);
                    expect(res.body.wallet.sub).toBeUndefined();
                    expect(res.body.pointBalance).toBe(100);
                })
                .expect(200, done);
        });

        // Claim ownership of wallet
        it('POST /account/wallet/connect', (done) => {
            user.post(`/v1/account/wallet/connect`)
                .set({ Authorization: widgetAccessToken3 })
                .send({ code })
                .expect((res: request.Response) => {
                    expect(res.body.sub).toBe(sub3);
                })
                .expect(200, done);
        });

        it('GET /wallets', (done) => {
            user.get(`/v1/account/wallet`)
                .set({ Authorization: widgetAccessToken3 })
                .expect(({ body }: request.Response) => {
                    expect(body.length).toBe(2);
                    const safe = body.find((wallet) => wallet.safeVersion);
                    expect(safe.sub).toBe(sub3);
                    expect(isAddress(safe.address)).toBeTruthy;
                    safeAddress = safe.address;
                })
                .expect(200, done);
        });

        // Subsequent claims should become available for the primary wallet
        it('POST /webhook/milestone/:token/claim for sub3 (for used code)', (done) => {
            user.post(`/v1/webhook/milestone/${milestoneReward.uuid}/claim`)
                .send({ code })
                .expect((res: request.Response) => {
                    expect(res.body.uuid).toBeDefined();
                    expect(res.body.milestoneRewardId).toBe(milestoneReward._id);
                    expect(res.body.wallet.address).toBe(safeAddress);
                })
                .expect(201, done);
        });

        // The GET wehbook should no longer return updated point balances for claimed wallets
        it('GET /webhook/wallet/:code (post reward claim)', (done) => {
            user.get('/v1/webhook/wallet/' + code)
                .send()
                .expect((res: request.Response) => {
                    expect(res.body.wallet.uuid).toBe(code);
                    expect(res.body.wallet.address).toBe('');
                    expect(res.body.pointBalance).toBe(0);
                })
                .expect(200, done);
        });

        // Show the correct amount of reward claims when listing perks for sub3
        it('GET /quests', (done) => {
            user.get(`/v1/quests`)
                .set({ 'Authorization': widgetAccessToken3, 'X-PoolId': pool._id })
                .send()
                .expect((res: request.Response) => {
                    expect(res.body.custom.find((r) => r._id === milestoneReward._id).claims).toHaveLength(2);
                })
                .expect(200, done);
        });
    });
});
