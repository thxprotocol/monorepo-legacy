import request from 'supertest';
import app from '@thxnetwork/api/';
import { ERC20Type, ChainId } from '@thxnetwork/api/types/enums';
import { dashboardAccessToken } from '@thxnetwork/api/util/jest/constants';
import { Contract } from 'web3-eth-contract';
import { isAddress, fromWei } from 'web3-utils';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getContractFromName } from '@thxnetwork/api/config/contracts';
import { getProvider } from '@thxnetwork/api/util/network';
import { BigNumber } from 'ethers';

const http = request.agent(app);
const user = request.agent(app);

describe('Transactions', () => {
    let poolAddress: string, tokenAddress: string, testToken: Contract, poolId: string;

    beforeAll(async () => {
        await beforeAllCallback();
    });

    afterAll(afterAllCallback);

    // PERFORM 2 DEPOSITS TO GENERATE TRANSACTIONS
    describe('Create Asset Pool Deposit', () => {
        const { defaultAccount } = getProvider(ChainId.Hardhat);
        const totalSupply = fromWei('200000000000000000000', 'ether'); // 200 eth

        it('Create token', (done) => {
            http.post('/v1/erc20')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    name: 'LIMITED SUPPLY TOKEN',
                    symbol: 'LIM',
                    type: ERC20Type.Limited,
                    totalSupply: totalSupply,
                })
                .expect(async ({ body }: request.Response) => {
                    expect(isAddress(body.address)).toBe(true);
                    tokenAddress = body.address;
                    testToken = getContractFromName(ChainId.Hardhat, 'LimitedSupplyToken', tokenAddress);
                    const adminBalance: BigNumber = await testToken.methods.balanceOf(defaultAccount).call();
                    expect(fromWei(String(adminBalance), 'ether')).toBe(totalSupply);
                })
                .expect(201, done);
        });

        it('Create pool', (done) => {
            http.post('/v1/pools')
                .set('Authorization', dashboardAccessToken)
                .send({
                    chainId: ChainId.Hardhat,
                    erc20tokens: [tokenAddress],
                    variant: 'defaultPool',
                })
                .expect(async (res: request.Response) => {
                    expect(isAddress(res.body.address)).toBe(true);
                    poolAddress = res.body.address;
                    poolId = res.body._id;
                    const adminBalance: BigNumber = await testToken.methods.balanceOf(defaultAccount).call();
                    const poolBalance: BigNumber = await testToken.methods.balanceOf(poolAddress).call();
                    expect(String(poolBalance)).toBe('0');
                    expect(fromWei(String(adminBalance), 'ether')).toBe(totalSupply);
                })
                .expect(201, done);
        });

        it('POST /deposits/admin/ 200 OK', (done) => {
            const amount = fromWei('100000000000000000000', 'ether'); // 100 eth
            http.post(`/v1/pools/${poolId}/topup`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
                .send({ amount })
                .expect(200, done);
        });

        it('POST /deposits/admin/ 200 OK', (done) => {
            const amount = fromWei('100000000000000000000', 'ether'); // 100 eth
            http.post(`/v1/pools/${poolId}/topup`)
                .set({ 'Authorization': dashboardAccessToken, 'X-PoolId': poolId })
                .send({ amount })
                .expect(200, done);
        });
    });

    describe('GET /transactions', () => {
        it('HTTP 200 and returns 2 items', (done) => {
            user.get('/v1/transactions?page=1&limit=2')
                .set('Authorization', dashboardAccessToken)
                .set({ 'X-PoolId': poolId })
                .expect(async (res: request.Response) => {
                    const result = res.body.results;
                    expect(result.length).toBe(2);
                })
                .expect(200, done);
        });
    });
});
