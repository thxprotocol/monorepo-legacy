import request from 'supertest';
import app from '@thxnetwork/api/';
import { AccountPlanType, ChainId, ERC20Type } from '../../types/enums';
import {
    dashboardAccessToken,
    MaxUint256,
    sub2,
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    userWalletAddress2,
    userWalletPrivateKey2,
    walletAccessToken,
    walletAccessToken2,
    walletAccessToken3,
} from '@thxnetwork/api/util/jest/constants';
import { isAddress } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { WithdrawalState } from '@thxnetwork/api/types/enums';
import { ClaimDocument } from '@thxnetwork/api/types/TClaim';
import { addMinutes, subMinutes } from '@thxnetwork/api/util/rewards';
import { getByteCodeForContractName, getContract, getContractFromName } from '@thxnetwork/api/config/contracts';
import { getProvider } from '@thxnetwork/api/util/network';
import { currentVersion } from '@thxnetwork/contracts/exports';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { HARDHAT_RPC, PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import Web3 from 'web3';
import { Account } from 'web3-core';
import { findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { toWei } from 'web3-utils';
import { Contract } from 'web3-eth-contract';

const user = request.agent(app);

describe('ERC20 Rewards', () => {
    let poolId: string, poolAddress: string, tokenAddress: string, erc20Perk: any;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    it('POST /erc20', (done) => {
        user.post('/v1/erc20')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                name: tokenName,
                symbol: tokenSymbol,
                type: ERC20Type.Unlimited,
                totalSupply: 0,
            })
            .expect(({ body }: request.Response) => {
                expect(isAddress(body.address)).toBe(true);
                tokenAddress = body.address;
            })
            .expect(201, done);
    });

    it('POST /pools', (done) => {
        user.post('/v1/pools')
            .set('Authorization', dashboardAccessToken)
            .send({
                chainId: ChainId.Hardhat,
                erc20tokens: [tokenAddress],
            })
            .expect((res: request.Response) => {
                expect(isAddress(res.body.address)).toBe(true);
                poolId = res.body._id;
                poolAddress = res.body.address;
            })
            .expect(201, done);
    });

    describe('Reward Limit === 0', () => {
        let claim: ClaimDocument;
        it('POST /erc20-perks', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            const pointPrice = 200;
            const image = 'http://myimage.com/1';
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    amount: 1,
                    platform: 0,
                    expiryDate,
                    rewardLimit: 0,
                    claimAmount: 1,
                    pointPrice,
                    image,
                })
                .expect((res: request.Response) => {
                    expect(res.body.uuid).toBeDefined();
                    expect(res.body.pointPrice).toBe(pointPrice);
                    expect(res.body.image).toBe(image);
                    expect(new Date(res.body.expiryDate).getTime()).toBe(expiryDate.getTime());
                    expect(res.body.claims.length).toBe(1);
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /erc20-perks/:id/claim', () => {
            it('should return a 200 and withdrawal id', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.claim._id).toBeDefined();
                        expect(res.body.withdrawal.state).toEqual(WithdrawalState.Withdrawn);
                    })
                    .expect(200, done);
            });

            it('should return a 403 for this second claim from the same account', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe('You can only claim this reward once.');
                    })
                    .expect(403, done);
            });

            it('should return a 200 for this second claim from another account', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect(200, done);
            });
        });
    });

    describe('Reward Limit === 1', () => {
        let claim: ClaimDocument, claim1: ClaimDocument;
        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    amount: 1,
                    platform: 0,
                    rewardLimit: 2,
                    expiryDate: addMinutes(new Date(), 30),
                    claimAmount: 1,
                })
                .expect((res: request.Response) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.claims.length).toBe(1);
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 200', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect(200, done);
            });

            it('should return a 403 for the second claim on the same account', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe('You can only claim this reward once.');
                    })
                    .expect(403, done);
            });

            it('should return a 200 for the second claim on another account', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect(200, done);
            });

            it('should return a 403 for the second claim on the same account', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe("This reward has reached it's limit");
                    })
                    .expect(403, done);
            });

            it('should return a 403 for the third claim on another account', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken3 })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe("This reward has reached it's limit");
                    })
                    .expect(403, done);
            });
        });
    });

    describe('Expiration Date < Date.now', () => {
        let claim: ClaimDocument;
        it('POST /erc20-perks', (done) => {
            user.post('/v1/erc20-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    amount: 1,
                    platform: 0,
                    rewardLimit: 0,
                    expiryDate: subMinutes(new Date(), 30),
                    claimAmount: 1,
                })
                .expect((res: request.Response) => {
                    expect(res.body._id).toBeDefined();
                    expect(res.body.claims).toBeDefined();
                    expect(res.body.claims[0].id).toBeDefined();
                    claim = res.body.claims[0];
                })
                .expect(201, done);
        });

        describe('POST /v1/claims/:id/collect', () => {
            it('should return a 403', (done) => {
                user.post(`/v1/claims/${claim.id}/collect`)
                    .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken })
                    .expect((res: request.Response) => {
                        expect(res.body.error.message).toBe('This reward claim has expired.');
                    })
                    .expect(403, done);
            });
        });
    });

    describe('GET /erc721-perks', () => {
        it('Should return a list of rewards', (done) => {
            user.get('/v1/erc20-perks')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .expect((res: request.Response) => {
                    expect(res.body.results.length).toBe(3);
                    expect(res.body.results[0].claims).toBeDefined();
                    expect(res.body.limit).toBe(10);
                    expect(res.body.total).toBe(3);
                    erc20Perk = res.body.results[0];
                    console.log(`/v1/erc20-perks/${erc20Perk._id}/purchase`);
                })
                .expect(200, done);
        });
    });

    describe('POST /erc721-perks/:id/purchase', () => {
        let testToken: Contract;
        const web3 = new Web3(HARDHAT_RPC);
        const wallet = web3.eth.accounts.privateKeyToAccount(userWalletPrivateKey2);

        it('TokenDeployed event', async () => {
            const { options } = getContract(ChainId.Hardhat, 'LimitedSupplyToken', currentVersion);
            testToken = await TransactionService.deploy(
                options.jsonInterface,
                getByteCodeForContractName('LimitedSupplyToken'),
                [tokenName, tokenSymbol, wallet.address, tokenTotalSupply],
                ChainId.Hardhat,
            );
            tokenAddress = testToken.options.address;
        });

        it('POST /pools', (done) => {
            user.post('/v1/pools')
                .set({ Authorization: dashboardAccessToken })
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [tokenAddress],
                })
                .expect((res: request.Response) => {
                    poolAddress = res.body.address;
                    poolId = res.body._id;
                    console.log('POOL', res.body);
                })
                .expect(201, done);
        });

        it('Increase pool balance', async () => {
            const amount = toWei(String(10000));
            const receipt = await TransactionService.send(
                tokenAddress,
                testToken.methods.transfer(poolAddress, amount),
                ChainId.Hardhat,
            );

            const event = findEvent('Transfer', parseLogs(testToken.options.jsonInterface, receipt.logs));
            expect(event).toBeDefined();
            expect(await testToken.methods.balanceOf(poolAddress)).toBe(amount);
        });

        it('Approve relayed transfer by pool', async () => {
            const { defaultAccount } = getProvider(ChainId.Hardhat);
            const admin = { address: defaultAccount, privateKey: PRIVATE_KEY } as Account;

            const { methods } = new web3.eth.Contract(testToken.options.jsonInterface, tokenAddress, {
                from: wallet.address,
            });
            const receipt = await methods.approve(admin.address, MaxUint256).send({ from: poolAddress });
            expect(receipt.events['Approval']).toBeDefined();
        });
        it('Should execute an ERC20Perk Purchase', (done) => {
            user.post(`/v1/erc20-perks/${erc20Perk._id}/purchase`)
                .set({ 'X-PoolId': poolId, 'Authorization': walletAccessToken2 })
                .send({
                    chainId: ChainId.Hardhat,
                })
                .expect((res: request.Response) => {
                    expect(res.body.erc20Transfer).toBeDefined();
                    expect(res.body.ERC20PerkPayment).toBeDefined();
                })
                .expect(200, done);
        });
    });
});
