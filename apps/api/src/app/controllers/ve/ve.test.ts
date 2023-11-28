import request from 'supertest';
import app from '@thxnetwork/api/';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getProvider } from '@thxnetwork/api/util/network';
import { BigNumber, Contract, ethers } from 'ethers';
import { ChainId } from '@thxnetwork/types/enums';
import { contractArtifacts } from '@thxnetwork/api/config/contracts';
import { sub, userWalletPrivateKey, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import SafeService from '@thxnetwork/api/services/SafeService';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { signTxHash } from '@thxnetwork/api/util/jest/network';
import { poll } from '@thxnetwork/api/util/polling';

const user = request.agent(app);
const { signer, defaultAccount } = getProvider(ChainId.Hardhat);

describe('VESytem', () => {
    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    const deploy = async (contractName: string, args: any[]): Promise<Contract> => {
        if (!contractArtifacts[contractName]) throw new Error('No artifact for contract name');
        const factory = new ethers.ContractFactory(
            contractArtifacts[contractName].abi,
            contractArtifacts[contractName].bytecode,
            signer,
        );
        return await factory.deploy(...args);
    };

    let safeWallet!: WalletDocument,
        launchpad!: Contract,
        testBPT!: Contract,
        testToken!: Contract,
        smartCheckerList!: Contract,
        vethx!: Contract;

    describe('Init system', () => {
        it('Deploy Tokens', async () => {
            safeWallet = await SafeService.findPrimary(sub, ChainId.Hardhat);
            expect(safeWallet.address).toBeDefined();
            testBPT = await deploy('BPTToken', []);
            expect(testBPT.address).toBeDefined();
            testToken = await deploy('TestToken', []);
            expect(testToken.address).toBeDefined();
        });

        it('Deploy Launchpad', async () => {
            const votingEscrowImpl = await deploy('VotingEscrow', []);
            const rewardDistributorImpl = await deploy('RewardDistributor', []);
            const rewardFaucetImpl = await deploy('RewardFaucet', []);

            launchpad = await deploy('Launchpad', [
                votingEscrowImpl.address,
                rewardDistributorImpl.address,
                rewardFaucetImpl.address,
            ]);

            expect(launchpad.address).toBeDefined();
        });

        it('Deploy VESystem', async () => {
            let tx = await launchpad.deploy(
                testBPT.address,
                'Voting Escrow THX',
                'VeTHX',
                7776000, // 90 days
                Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days from now
                defaultAccount, // Admin unlock all
                defaultAccount, // Admin early unlock
            );
            tx = await tx.wait();

            const event = tx.events.find((event: any) => event.event == 'VESystemCreated');
            const { votingEscrow, rewardDistributor, admin } = event.args;
            expect(admin).toBe(defaultAccount);

            vethx = new ethers.Contract(votingEscrow, contractArtifacts['VotingEscrow'].abi, signer);
            smartCheckerList = await deploy('SmartWalletWhitelist', [defaultAccount]);
            expect(smartCheckerList.address).toBeDefined();

            // Add smart wallet whitelist checker
            await vethx.commit_smart_wallet_checker(smartCheckerList.address);
            await vethx.apply_smart_wallet_checker();

            // Set early exit penalty treasury to reward distributor
            await vethx.set_penalty_treasury(rewardDistributor);

            expect(vethx.address).toBeDefined();
        });
    });

    describe('Deposit BPT ', () => {
        const totalSupplyInWei = String(ethers.utils.parseUnits('1000000', 'ether'));
        const amountInWei = String(ethers.utils.parseUnits('1000', 'ether'));

        it('Mint BPT for Safe Wallet', async () => {
            let tx = await testBPT.mint(safeWallet.address, totalSupplyInWei);
            tx = await tx.wait();
            const event = tx.events.find((ev) => ev.event === 'Transfer');
            expect(event).toBeDefined();
        });

        it('WhiteList Safe Wallet', async () => {
            let tx = await smartCheckerList.approveWallet(safeWallet.address);
            tx = await tx.wait();
            const event = tx.events.find((ev) => ev.event === 'ApproveWallet');
            expect(event).toBeDefined();
        });

        it('Approve', async () => {
            const { status, body } = await user
                .post('/v1/ve/approve')
                .set({ Authorization: widgetAccessToken })
                .send({ amountInWei, veAddress: vethx.address, bptAddress: testBPT.address });
            expect(body.safeTxHash).toBeDefined();
            expect(status).toBe(201);

            const { signature } = await signTxHash(safeWallet.address, body.safeTxHash, userWalletPrivateKey);
            await user
                .post('/v1/account/wallet/confirm')
                .set({ Authorization: widgetAccessToken })
                .send({ chainId: ChainId.Hardhat, safeTxHash: body.safeTxHash, signature })
                .expect(200);
        });

        it('Wait for approved amount', async () => {
            await poll(
                () => testBPT.allowance(safeWallet.address, vethx.address),
                (result: BigNumber) => result.eq(0),
                1000,
            );
        });

        // it('Deposit', async () => {
        //     const endTimestamp = Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 12; // 12 weeks from now
        //     const { status, body } = await user
        //         .post('/v1/ve/deposit')
        //         .set({ Authorization: widgetAccessToken })
        //         .send({ amountInWei, veAddress: vethx.address, bptAddress: testBPT.address, endTimestamp });
        //     expect(body.safeTxHash).toBeDefined();
        //     expect(status).toBe(201);

        //     const { signature } = await signTxHash(safeWallet.address, body.safeTxHash, userWalletPrivateKey);
        //     await user
        //         .post('/v1/account/wallet/confirm')
        //         .set({ Authorization: widgetAccessToken })
        //         .send({ chainId: ChainId.Hardhat, safeTxHash: body.safeTxHash, signature })
        //         .expect(200);
        // });

        // it('Wait for locked amount', async () => {
        //     await poll(
        //         () => vethx.locked(safeWallet.address),
        //         (result: { amount: BigNumber }) => BigNumber.from(result.amount).eq(0),
        //         1000,
        //     );
        // });

        // it('Confirm Deposit ', async () => {
        //     const { signature } = await signTxHash(safeWallet.address, safeTxHash, userWalletPrivateKey);
        //     await user
        //         .post('/v1/account/wallet/confirm')
        //         .set({ Authorization: widgetAccessToken })
        //         .send({ chainId: ChainId.Hardhat, safeTxHash, signature })
        //         .expect(200);
        // });
    });

    describe('Withdraw BPT ', () => {
        //
    });
});
