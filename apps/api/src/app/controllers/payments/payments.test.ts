import app from '@thxnetwork/api/';
import request, { Response } from 'supertest';
import { Account } from 'web3-core';
import { isAddress, toWei } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { ChainId } from '@thxnetwork/api/types/enums';
import {
    account2,
    adminAccessToken,
    dashboardAccessToken,
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    userWalletPrivateKey2,
    walletAccessToken,
} from '@thxnetwork/api/util/jest/constants';
import { getByteCodeForContractName, getContract } from '@thxnetwork/api/config/contracts';
import { PaymentState } from '@thxnetwork/api/types/enums/PaymentState';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { getProvider } from '@thxnetwork/api/util/network';
import { HARDHAT_RPC, PRIVATE_KEY, WALLET_URL } from '@thxnetwork/api/config/secrets';
import Web3 from 'web3';
import { ERC721TokenState } from '@thxnetwork/api/types/TERC721';
import { addMinutes } from '@thxnetwork/api/util/rewards';

const http = request.agent(app);

describe('Payment Request', () => {
    let basicAccessToken: string,
        poolId: string,
        poolAddress: string,
        paymentId: string,
        admin: Account,
        erc20: Contract,
        erc721Address: string,
        erc721ID: string,
        metadataId: string,
        claimId: string,
        erc721PerkId: string;

    const amount = '1000',
        successUrl = 'https://exmaple.com/success',
        failUrl = 'https://exmaple.com/fail',
        cancelUrl = 'https://exmaple.com/cancel';

    afterAll(afterAllCallback);

    beforeAll(async () => {
        await beforeAllCallback();
        const { defaultAccount } = getProvider(ChainId.Hardhat);
        admin = { address: defaultAccount, privateKey: PRIVATE_KEY } as Account;
    });

    describe('For ERC20 Token', () => {
        it('Deploy existing token', async () => {
            const { options } = getContract(ChainId.Hardhat, 'LimitedSupplyToken', currentVersion);
            erc20 = await TransactionService.deploy(
                options.jsonInterface,
                getByteCodeForContractName('LimitedSupplyToken'),
                [tokenName, tokenSymbol, admin.address, toWei(String(tokenTotalSupply))],
                ChainId.Hardhat,
            );
            await erc20.methods.transfer(account2.address, '5000').send({ from: admin.address });
        });

        it('Create pool', (done) => {
            http.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [erc20.options.address],
                })
                .expect((res: Response) => {
                    expect(isAddress(res.body.address)).toBe(true);
                    poolId = res.body._id;
                    poolAddress = res.body.address;
                })
                .expect(201, done);
        });

        it('should Request a payment', (done) => {
            http.post('/v1/payments')
                .set({ 'Authorization': adminAccessToken, 'X-PoolId': poolId })
                .send({
                    amount,
                    successUrl,
                    failUrl,
                    cancelUrl,
                    chainId: ChainId.Hardhat,
                })
                .expect(({ body }: Response) => {
                    paymentId = body.id;
                    basicAccessToken = body.token;

                    expect(body.paymentUrl).toBe(
                        `${WALLET_URL}/payment/${String(paymentId)}?accessToken=${basicAccessToken}`,
                    );
                    expect(body.successUrl).toBe(successUrl);
                    expect(body.failUrl).toBe(failUrl);
                    expect(body.cancelUrl).toBe(cancelUrl);
                    expect(body.chainId).toBe(31337);
                    expect(body.state).toBe(PaymentState.Requested);
                    expect(body.tokenAddress).toBe(erc20.options.address);
                    expect(body.token).toHaveLength(32);
                    expect(body.receiver).toBe(poolAddress);
                    expect(body.amount).toBe(amount);
                })
                .expect(201, done);
        });

        it('Get payment information', (done) => {
            http.get('/v1/payments/' + paymentId)
                .set({ 'X-Payment-Token': basicAccessToken })
                .expect(({ body }: Response) => {
                    expect(body.successUrl).toBe(successUrl);
                    expect(body.failUrl).toBe(failUrl);
                    expect(body.cancelUrl).toBe(cancelUrl);
                    expect(body.chainId).toBe(31337);
                    expect(body.state).toBe(PaymentState.Requested);
                    expect(body.tokenAddress).toBe(erc20.options.address);
                    expect(body.token).toHaveLength(32);
                    expect(body.receiver).toBe(poolAddress);
                    expect(body.amount).toBe(amount);
                })
                .expect(200, done);
        });

        it('Approve relayed transfer by pool', async () => {
            const web3 = new Web3(HARDHAT_RPC);
            const wallet = web3.eth.accounts.privateKeyToAccount(userWalletPrivateKey2);
            const { methods } = new web3.eth.Contract(erc20.options.jsonInterface, erc20.options.address, {
                from: wallet.address,
            });
            const receipt = await methods.approve(admin.address, amount).send({ from: wallet.address });
            expect(receipt.events['Approval']).toBeDefined();
        });

        it('Relay payment transfer', async () => {
            await http
                .post(`/v1/payments/${paymentId}/pay`)
                .set({
                    'Authorization': walletAccessToken,
                    'X-PoolId': poolId,
                    'X-Payment-Token': basicAccessToken,
                })
                .expect(({ body }: Response) => {
                    expect(body.state).toBe(PaymentState.Completed);
                })
                .expect(200);
        });
    });

    describe('for ERC721 Token', () => {
        const name = 'Planets of the Galaxy',
            symbol = 'GLXY',
            description = 'description',
            schema = [
                { name: 'color', propType: 'string', description: 'lorem ipsum' },
                { name: 'size', propType: 'string', description: 'lorem ipsum dolor sit' },
            ];

        it('Deploy an ERC20 Token', async () => {
            const { options } = getContract(ChainId.Hardhat, 'LimitedSupplyToken', currentVersion);
            erc20 = await TransactionService.deploy(
                options.jsonInterface,
                getByteCodeForContractName('LimitedSupplyToken'),
                [tokenName, tokenSymbol, admin.address, toWei(String(tokenTotalSupply))],
                ChainId.Hardhat,
            );
            await erc20.methods.transfer(account2.address, '5000').send({ from: admin.address });
        });

        describe('POST /erc721', () => {
            it('should create an ERC721 and return contract details', (done) => {
                http.post('/v1/erc721')
                    .set('Authorization', dashboardAccessToken)
                    .send({
                        chainId: ChainId.Hardhat,
                        name,
                        symbol,
                        description,
                        schema,
                    })
                    .expect(({ body }: request.Response) => {
                        expect(body._id).toBeDefined();
                        expect(body.address).toBeDefined();
                        erc721ID = body._id;
                        erc721Address = body.address;
                    })
                    .expect(201, done);
            });
        });

        describe('POST /pools', () => {
            it('should create a POOL', (done) => {
                http.post('/v1/pools')
                    .set('Authorization', dashboardAccessToken)
                    .send({
                        chainId: ChainId.Hardhat,
                        erc20tokens: [erc20.options.address],
                        erc721tokens: [erc721Address],
                    })
                    .expect(({ body }: request.Response) => {
                        expect(isAddress(body.address)).toBe(true);
                        expect(body.erc721Id).toBe(erc721ID);
                        poolId = body._id;
                        poolAddress = body.address;
                    })
                    .expect(201, done);
            });
        });

        describe('POST /erc721/:id/metadata', () => {
            it('should create a Metadada', (done) => {
                const value1 = 'blue',
                    value2 = 'small';

                http.post('/v1/erc721/' + erc721ID + '/metadata')
                    .set('Authorization', dashboardAccessToken)
                    .set('X-PoolId', poolId)
                    .send({
                        attributes: [
                            { key: schema[0].name, value: value1 },
                            { key: schema[1].name, value: value2 },
                        ],
                    })
                    .expect(({ body }: request.Response) => {
                        expect(body._id).toBeDefined();
                        expect(body.attributes[0].key).toBe(schema[0].name);
                        expect(body.attributes[1].key).toBe(schema[1].name);
                        expect(body.attributes[0].value).toBe(value1);
                        expect(body.attributes[1].value).toBe(value2);
                        metadataId = body._id;
                    })
                    .expect(201, done);
            });
        });

        it('POST /erc721-perks', (done) => {
            const expiryDate = addMinutes(new Date(), 30);
            const pointPrice = 200;
            http.post('/v1/erc721-perks/')
                .set({ 'X-PoolId': poolId, 'Authorization': dashboardAccessToken })
                .send({
                    title: 'Expiration date is next 30 min',
                    description: 'Lorem ipsum dolor sit amet',
                    erc721metadataIds: JSON.stringify([metadataId]),
                    platform: 0,
                    expiryDate,
                    rewardLimit: 1,
                    claimAmount: 1,
                    pointPrice,
                })
                .expect((res: request.Response) => {
                    expect(res.body[0]._id).toBeDefined();
                    expect(res.body[0].pointPrice).toBe(pointPrice);
                    expect(res.body[0].claims.length).toBe(1);
                    expect(res.body[0].claims[0].uuid).toBeDefined();
                    claimId = res.body[0].claims[0]._id;
                    erc721PerkId = res.body[0]._id;
                })
                .expect(201, done);
        });

        describe('POST payment', () => {
            it('should Request a payment', (done) => {
                http.post('/v1/payments')
                    .set({ 'Authorization': adminAccessToken, 'X-PoolId': poolId })
                    .send({
                        amount,
                        successUrl,
                        failUrl,
                        cancelUrl,
                        chainId: ChainId.Hardhat,
                        metadataId,
                    })
                    .expect(({ body }: Response) => {
                        paymentId = body.id;
                        basicAccessToken = body.token;

                        expect(body.paymentUrl).toBe(
                            `${WALLET_URL}/payment/${String(paymentId)}?accessToken=${basicAccessToken}`,
                        );
                        expect(body.successUrl).toBe(successUrl);
                        expect(body.failUrl).toBe(failUrl);
                        expect(body.cancelUrl).toBe(cancelUrl);
                        expect(body.chainId).toBe(31337);
                        expect(body.state).toBe(PaymentState.Requested);
                        expect(body.tokenAddress).toBe(erc20.options.address);
                        expect(body.token).toHaveLength(32);
                        expect(body.receiver).toBe(poolAddress);
                        expect(body.amount).toBe(amount);
                        expect(body.metadataId).toBe(metadataId);
                    })
                    .expect(201, done);
            });

            it('Get payment information', (done) => {
                http.get('/v1/payments/' + paymentId)
                    .set({ 'X-Payment-Token': basicAccessToken })
                    .expect(({ body }: Response) => {
                        expect(body.successUrl).toBe(successUrl);
                        expect(body.failUrl).toBe(failUrl);
                        expect(body.cancelUrl).toBe(cancelUrl);
                        expect(body.chainId).toBe(31337);
                        expect(body.state).toBe(PaymentState.Requested);
                        expect(body.tokenAddress).toBe(erc20.options.address);
                        expect(body.token).toHaveLength(32);
                        expect(body.receiver).toBe(poolAddress);
                        expect(body.amount).toBe(amount);
                        expect(body.metadataId).toBe(metadataId);
                        expect(body.metadata).toBeDefined();
                    })
                    .expect(200, done);
            });

            it('should Approve relayed transfer by pool', async () => {
                const web3 = new Web3(HARDHAT_RPC);
                const wallet = web3.eth.accounts.privateKeyToAccount(userWalletPrivateKey2);
                const { methods } = new web3.eth.Contract(erc20.options.jsonInterface, erc20.options.address, {
                    from: wallet.address,
                });
                const receipt = await methods.approve(admin.address, amount).send({ from: wallet.address });
                expect(receipt.events['Approval']).toBeDefined();
            });

            it('should Relay payment transfer', async () => {
                await http
                    .post(`/v1/payments/${paymentId}/pay`)
                    .set({
                        'Authorization': walletAccessToken,
                        'X-PoolId': poolId,
                        'X-Payment-Token': basicAccessToken,
                    })
                    .expect(({ body }: Response) => {
                        expect(body.state).toBe(PaymentState.Completed);
                    })
                    .expect(200);
            });
        });

        describe('GET erc721/token', () => {
            it('should return ERC721Token with state = MINTED', (done) => {
                http.get('/v1/erc721/token')
                    .set('Authorization', walletAccessToken)
                    .send()
                    .expect(({ body }: request.Response) => {
                        expect(body[0].erc721Id).toBe(erc721ID);
                        expect(body[0].state).toBe(ERC721TokenState.Minted);
                        expect(body[0].transactions.length).toBe(1);
                    })
                    .expect(200, done);
            });
        });
    });
});
