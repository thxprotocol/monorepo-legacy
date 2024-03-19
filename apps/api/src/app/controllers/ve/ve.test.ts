import request from 'supertest';
import app from '@thxnetwork/api/';
import { afterAllCallback, beforeAllCallback } from '@thxnetwork/api/util/jest/config';
import { getProvider } from '@thxnetwork/api/util/network';
import { BigNumber, Contract, ethers } from 'ethers';
import { ChainId } from '@thxnetwork/common/enums';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { sub, userWalletPrivateKey, widgetAccessToken } from '@thxnetwork/api/util/jest/constants';
import { WalletDocument } from '@thxnetwork/api/models/Wallet';
import { signTxHash, timeTravel } from '@thxnetwork/api/util/jest/network';
import { poll } from '@thxnetwork/api/util/polling';
import SafeService from '@thxnetwork/api/services/SafeService';

const user = request.agent(app);
const { signer } = getProvider(ChainId.Hardhat);

describe('VESytem', () => {
    beforeAll(beforeAllCallback);
    afterAll(afterAllCallback);

    const amountInWei = String(ethers.utils.parseUnits('1000', 'ether'));
    const chainId = ChainId.Hardhat;

    let safeWallet!: WalletDocument,
        testBPT!: Contract,
        testBPTGauge!: Contract,
        testBAL!: Contract,
        vethx!: Contract,
        rdthx!: Contract,
        rfthx!: Contract,
        scthx!: Contract;

    it('Deploy Tokens', async () => {
        safeWallet = await SafeService.findOne({ sub, poolId: { $exists: false }, safeVersion: { $exists: true } });
        expect(safeWallet.address).toBeDefined();

        testBAL = new ethers.Contract(contractNetworks[chainId].BAL, contractArtifacts['BAL'].abi, signer);
        testBPT = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);
        testBPTGauge = new ethers.Contract(
            contractNetworks[chainId].BPTGauge,
            contractArtifacts['BPTGauge'].abi,
            signer,
        );

        vethx = new ethers.Contract(
            contractNetworks[chainId].VotingEscrow,
            contractArtifacts['VotingEscrow'].abi,
            signer,
        );
        rdthx = new ethers.Contract(
            contractNetworks[chainId].RewardDistributor,
            contractArtifacts['RewardDistributor'].abi,
            signer,
        );
        rfthx = new ethers.Contract(
            contractNetworks[chainId].RewardFaucet,
            contractArtifacts['RewardFaucet'].abi,
            signer,
        );
        scthx = new ethers.Contract(
            contractNetworks[chainId].SmartWalletWhitelist,
            contractArtifacts['SmartWalletWhitelist'].abi,
            signer,
        );
    });

    describe('Create Reward Distribution', () => {
        it('Create Reward Distribution after first week', async () => {
            const amountBPT = String(ethers.utils.parseUnits('100000', 'ether'));
            const amountBAL = String(ethers.utils.parseUnits('1000', 'ether'));

            // Travel past first week else this throws "Reward distribution has not started yet"
            await timeTravel(60 * 60 * 24 * 7);

            // Deposit reward tokens into rdthx
            await testBPT.approve(rfthx.address, amountBPT);
            await testBAL.approve(rfthx.address, amountBAL);
            await rfthx.depositEqualWeeksPeriod(testBPT.address, amountBPT, '4');
            await rfthx.depositEqualWeeksPeriod(testBAL.address, amountBAL, '4');
        });
    });

    describe('Stake BPT ', () => {
        it('Balance = total', async () => {
            let tx = await testBPT.transfer(safeWallet.address, amountInWei);
            tx = await tx.wait();
            const event = tx.events.find((ev) => ev.event === 'Transfer');
            expect(event).toBeDefined();
            const balanceInWei = await testBPT.balanceOf(safeWallet.address);
            expect(balanceInWei.gt(0)).toBe(true);
        });
        it('Approve', async () => {
            const { status, body } = await user
                .post('/v1/erc20/allowance')
                .set({ Authorization: widgetAccessToken })
                .query({ walletId: String(safeWallet._id) })
                .send({ tokenAddress: testBPT.address, amountInWei, spender: testBPTGauge.address });
            expect(status).toBe(201);

            for (const tx of body) {
                expect(tx.safeTxHash).toBeDefined();

                const { signature } = await signTxHash(safeWallet.address, tx.safeTxHash, userWalletPrivateKey);
                await user
                    .post('/v1/account/wallets/confirm')
                    .set({ Authorization: widgetAccessToken })
                    .query({ walletId: String(safeWallet._id) })
                    .send({ chainId: ChainId.Hardhat, safeTxHash: tx.safeTxHash, signature })
                    .expect(200);
            }
        });

        it('Wait for approved amount', async () => {
            // Replace with API call
            await poll(
                () => testBPT.allowance(safeWallet.address, testBPTGauge.address),
                (result: BigNumber) => result.eq(0),
                1000,
            );
        });

        it('Stake 1000 BPT', async () => {
            const { status, body } = await user
                .post('/v1/liquidity/stake')
                .set({ Authorization: widgetAccessToken })
                .query({ walletId: String(safeWallet._id) })
                .send({ amountInWei });
            expect(status).toBe(201);
            for (const tx of body) {
                expect(tx.safeTxHash).toBeDefined();

                const { signature } = await signTxHash(safeWallet.address, tx.safeTxHash, userWalletPrivateKey);
                await user
                    .post('/v1/account/wallets/confirm')
                    .set({ Authorization: widgetAccessToken })
                    .query({ walletId: String(safeWallet._id) })
                    .send({ chainId: ChainId.Hardhat, safeTxHash: tx.safeTxHash, signature })
                    .expect(200);
            }
        });

        it('User received BPT-gauge', async () => {
            await poll(
                () => testBPTGauge.balanceOf(safeWallet.address),
                (amount: BigNumber) => BigNumber.from(amount).eq(0),
                1000,
            );

            const balanceInWei = await testBPTGauge.balanceOf(safeWallet.address);
            expect(balanceInWei.gt(0)).toBe(true);
        });
    });

    describe('Lock BPT-gauge ', () => {
        it('WhiteList Safe Wallet', async () => {
            // Move this to step 1 in VE UI modals
            let tx = await scthx.approveWallet(safeWallet.address);
            tx = await tx.wait();
            const event = tx.events.find((ev) => ev.event === 'ApproveWallet');
            expect(event).toBeDefined();
        });

        it('Approve', async () => {
            const { status, body } = await user
                .post('/v1/erc20/allowance')
                .set({ Authorization: widgetAccessToken })
                .query({ walletId: String(safeWallet._id) })
                .send({
                    tokenAddress: contractNetworks[chainId].BPTGauge,
                    amountInWei,
                    spender: contractNetworks[chainId].VotingEscrow,
                });
            expect(status).toBe(201);

            for (const tx of body) {
                expect(tx.safeTxHash).toBeDefined();

                const { signature } = await signTxHash(safeWallet.address, tx.safeTxHash, userWalletPrivateKey);
                await user
                    .post('/v1/account/wallets/confirm')
                    .set({ Authorization: widgetAccessToken })
                    .query({ walletId: String(safeWallet._id) })
                    .send({ chainId: ChainId.Hardhat, safeTxHash: tx.safeTxHash, signature })
                    .expect(200);
            }
        });

        it('Wait for approved amount', async () => {
            // Replace with API call
            await poll(
                () => testBPTGauge.allowance(safeWallet.address, vethx.address),
                (result: BigNumber) => result.eq(0),
                1000,
            );
        });

        it('Deposit 1000', async () => {
            const lockEndTimestamp = Math.ceil(Date.now() / 1000) + 60 * 60 * 24 * 7 * 12; // 12 weeks from now
            const { status, body } = await user
                .post('/v1/ve/deposit')
                .set({ Authorization: widgetAccessToken })
                .query({ walletId: String(safeWallet._id) })
                .send({ amountInWei, lockEndTimestamp });
            expect(status).toBe(201);
            for (const tx of body) {
                expect(tx.safeTxHash).toBeDefined();

                const { signature } = await signTxHash(safeWallet.address, tx.safeTxHash, userWalletPrivateKey);
                await user
                    .post('/v1/account/wallets/confirm')
                    .set({ Authorization: widgetAccessToken })
                    .query({ walletId: String(safeWallet._id) })
                    .send({ chainId: ChainId.Hardhat, safeTxHash: tx.safeTxHash, signature })
                    .expect(200);
            }
        });

        it('Balance = total - deposit', async () => {
            await poll(
                () => vethx.locked(safeWallet.address),
                (result: { amount: BigNumber }) => BigNumber.from(result.amount).eq(0),
                1000,
            );

            const balanceInWei = await testBPTGauge.balanceOf(safeWallet.address);
            const totalMinDeposit = BigNumber.from(amountInWei).sub(amountInWei);

            expect(balanceInWei.eq(totalMinDeposit)).toBe(true);
        });

        it('List locks ', async () => {
            const { status, body } = await user
                .get('/v1/ve')
                .query({ walletId: String(safeWallet._id) })
                .set({ Authorization: widgetAccessToken })
                .send();

            expect(Number(body[0].rewards)).toBe;
            expect(Number(body[0].end)).toBeGreaterThan(Number(body[0].now));
            expect(body[0].amount).toBe(amountInWei);
            expect(status).toBe(200);
        });
    });

    // describe('Claim THX incentives', () => {
    //     it('Claim Tokens (after 14 days)', async () => {
    //         console.log(await rfthx.getUpcomingRewardsForNWeeks(testBPT.address, 4));
    //         console.log(await rfthx.getUpcomingRewardsForNWeeks(testBAL.address, 4));

    //         // Travel past end date of the first reward eligible week
    //         await timeTravel(60 * 60 * 24 * 8);

    //         console.log(await rfthx.getUpcomingRewardsForNWeeks(testBPT.address, 4));
    //         console.log(await rfthx.getUpcomingRewardsForNWeeks(testBAL.address, 4));

    //         const balance = await testBPT.balanceOf(safeWallet.address);
    //         expect(balance).toBeDefined();

    //         let tx = await rdthx.claimToken(safeWallet.address, testBPT.address);
    //         tx = await tx.wait();

    //         const event = tx.events.find((ev) => ev.event === 'TokenCheckpointed');
    //         expect(event).toBeDefined();

    //         const balanceAfterClaim = await testBPT.balanceOf(safeWallet.address);
    //         expect(BigNumber.from(balance).lt(balanceAfterClaim)).toBe(true);
    //     });
    // });

    describe('Withdraw BPT', () => {
        it('Withdraw', async () => {
            const { status, body } = await user
                .post('/v1/ve/withdraw')
                .set({ Authorization: widgetAccessToken })
                .query({ walletId: String(safeWallet._id) })
                .send({ isEarlyAttempt: false });
            expect(status).toBe(403);
            expect(body.error.message).toBe('Funds are locked');
        });

        it('Withdraw Early 1000 - penalty', async () => {
            const { status, body } = await user
                .post('/v1/ve/withdraw')
                .set({ Authorization: widgetAccessToken })
                .query({ walletId: String(safeWallet._id) })
                .send({ isEarlyAttempt: true });
            expect(status).toBe(201);
            for (const tx of body) {
                expect(tx.safeTxHash).toBeDefined();

                const { signature } = await signTxHash(safeWallet.address, tx.safeTxHash, userWalletPrivateKey);
                await user
                    .post('/v1/account/wallets/confirm')
                    .set({ Authorization: widgetAccessToken })
                    .query({ walletId: String(safeWallet._id) })
                    .send({ chainId: ChainId.Hardhat, safeTxHash: tx.safeTxHash, signature })
                    .expect(200);
            }
        });

        // it('Balance = total + deposit - penalty', async () => {
        //     await poll(
        //         () => vethx.locked(safeWallet.address),
        //         (result: { amount: BigNumber }) => !BigNumber.from(result.amount).eq(0),
        //         1000,
        //     );

        //     const balanceInWei = await testBPT.balanceOf(safeWallet.address);
        //     // const rdBalanceInWei = await testBPT.balanceOf(rdthx.address);
        //     // console.log(
        //     //     String(balanceInWei), // 1024259542566872427984000
        //     //     String(rdBalanceInWei), //   25740457433127572016000
        //     //     String(balanceInWei.add(rdBalanceInWei)), // 1050000000000000000000000
        //     //     String(balanceInWei.add(rdBalanceInWei).sub(totalSupplyInWei)), //   50000000000000000000000
        //     // );

        //     // Due to early exit expect less BPT to be returned and the balance of
        //     // the penalty treasury to increase. Formula to calculate the penalty is in
        //     // the VE contract.
        //     // Eg:
        //     // balanceInWei     = 999917384259259259260000
        //     // rdBalanceInWei   =     82615740740740740000
        //     // console.log(String(balanceInWei), amountInWei);
        //     // Should be larger due to reward claim
        //     // console.log(String(balanceInWei));
        //     // console.log(String(amountInWei));
        //     // console.log(String(BigNumber.from(balanceInWei).sub(BigNumber.from(amountInWei))));
        //     console.log('balanceInWei', balanceInWei.toString());
        //     expect(BigNumber.from(balanceInWei).gt(BigNumber.from(amountInWei))).toBe(true);
        // });
    });
});
