import db from '@thxnetwork/api/util/database';
import { mockStart } from './mock';
import { safeVersion } from '@thxnetwork/api/services/ContractService';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId, WalletVariant } from '@thxnetwork/common/enums';
import {
    sub,
    sub2,
    sub3,
    sub4,
    userWalletAddress,
    userWalletAddress2,
    userWalletAddress3,
    userWalletAddress4,
} from './constants';
import { Wallet } from '@thxnetwork/api/models';
import Safe, { SafeFactory } from '@safe-global/protocol-kit';
import { contractNetworks } from '@thxnetwork/contracts/exports';
import { poll } from '../polling';
import { agenda } from '../agenda';

export async function beforeAllCallback(options = { skipWalletCreation: false }) {
    mockStart();

    const { web3, defaultAccount, ethAdapter } = getProvider(ChainId.Hardhat);
    // Wait for this hardhat log:
    const lastDeployedContractAddress = '0x726c9c8278ec209cfbe6bbb1d02e65df6fcb7cda';
    const fn = () => web3.eth.getCode(lastDeployedContractAddress);
    const fnCondition = (result: string) => result === '0x';

    await poll(fn, fnCondition, 500);

    if (!options.skipWalletCreation) {
        const chainId = ChainId.Hardhat;
        const safeFactory = await SafeFactory.create({
            safeVersion,
            ethAdapter,
            contractNetworks,
        });
        for (const entry of [
            { sub, userWalletAddress },
            { sub: sub2, userWalletAddress: userWalletAddress2 },
            { sub: sub3, userWalletAddress: userWalletAddress3 },
        ]) {
            const safeAccountConfig = {
                owners: [defaultAccount, entry.userWalletAddress],
                threshold: 2,
            };
            const safeAddress = await safeFactory.predictSafeAddress(safeAccountConfig);

            await Wallet.create({
                sub: entry.sub,
                safeVersion,
                address: safeAddress,
                chainId,
                variant: WalletVariant.Safe,
            });

            try {
                await Safe.create({
                    ethAdapter,
                    safeAddress,
                    contractNetworks,
                });
            } catch (error) {
                await safeFactory.deploySafe({ safeAccountConfig, options: { gasLimit: '3000000' } });
            }
        }

        // Create wallet for metamask account
        await Wallet.create({
            chainId: ChainId.Hardhat,
            sub: sub4,
            address: userWalletAddress4,
            variant: WalletVariant.WalletConnect,
        });
    }
}

export async function afterAllCallback() {
    await new Promise<void>((resolve) => {
        // Listen for 'complete' event
        agenda.on('complete', () => {
            resolve();
        });
    });
    await agenda.stop();
    await agenda.cancel({});
    await agenda.purge();
    await db.truncate();
}
