import request from 'supertest';
import app from '@thxnetwork/api/';
import { ChainId } from '../../types/enums';
import {
    dashboardAccessToken,
    MaxUint256,
    tokenName,
    tokenSymbol,
    tokenTotalSupply,
    userWalletPrivateKey2,
    walletAccessToken2,
} from '@thxnetwork/api/util/jest/constants';
import { getByteCodeForContractName, getContract } from '@thxnetwork/api/config/contracts';
import { getProvider } from '@thxnetwork/api/util/network';
import { currentVersion } from '@thxnetwork/contracts/exports';
import TransactionService from '@thxnetwork/api/services/TransactionService';
import { HARDHAT_RPC, PRIVATE_KEY } from '@thxnetwork/api/config/secrets';
import Web3 from 'web3';
import { Account } from 'web3-core';
import { findEvent, parseLogs } from '@thxnetwork/api/util/events';
import { toWei } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { TERC20Perk } from '@thxnetwork/types/index';

const user = request.agent(app);

describe('POST /erc721-perks/:id/purchase', () => {
    let testToken: Contract, erc20Perk: TERC20Perk, tokenAddress: string, poolAddress: string, poolId: string;
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
