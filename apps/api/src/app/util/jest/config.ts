import db from '@thxnetwork/api/util/database';
import { mockStart } from './mock';
import { safeVersion } from '@thxnetwork/api/config/contracts';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/types/enums';
import { getContract, getContractConfig } from '@thxnetwork/api/config/contracts';
import { poll } from '../polling';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { sub, sub2, sub3, userWalletAddress, userWalletAddress2, userWalletAddress3 } from './constants';
import { Wallet } from '@thxnetwork/api/services/SafeService';
import Safe, { SafeFactory } from '@safe-global/protocol-kit';
import { contractNetworks } from '@thxnetwork/api/config/contracts';

export async function beforeAllCallback(options = { skipWalletCreation: false }) {
    await db.truncate();
    mockStart();

    const { web3, defaultAccount, ethAdapter } = getProvider(ChainId.Hardhat);
    const fn = () => web3.eth.getCode(getContractConfig(ChainId.Hardhat, 'OwnershipFacet').address);
    const fnCondition = (result: string) => result === '0x';

    await poll(fn, fnCondition, 500);

    const registryAddress = getContractConfig(ChainId.Hardhat, 'Registry', currentVersion).address;
    const factory = getContract(ChainId.Hardhat, 'Factory');

    // TODO Make this part of hardhat container build
    await factory.methods.initialize(defaultAccount, registryAddress).send({ from: defaultAccount });

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
    }
}

export async function afterAllCallback() {
    // await db.connection.collection('jobs').deleteMany({});
}
