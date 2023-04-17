import db from '@thxnetwork/api/util/database';
import { mockStart, mockClear } from './mock';
import { agenda } from '@thxnetwork/api/util/agenda';
import { logger } from '@thxnetwork/api/util/logger';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/types/enums';
import { getContract, getContractConfig } from '@thxnetwork/api/config/contracts';
import { poll } from '../polling';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { sub, sub2, userWalletAddress, userWalletAddress2 } from './constants';

export async function beforeAllCallback(options = { skipWalletCreation: false }) {
    await db.truncate();
    mockStart();

    const { web3, defaultAccount } = getProvider(ChainId.Hardhat);
    const fn = () => web3.eth.getCode(getContractConfig(ChainId.Hardhat, 'OwnershipFacet').address);
    const fnCondition = (result: string) => result === '0x';

    await poll(fn, fnCondition, 500);

    const registryAddress = getContractConfig(ChainId.Hardhat, 'Registry', currentVersion).address;
    const factory = getContract(ChainId.Hardhat, 'Factory');

    // TODO Make this part of hardhat container build
    await factory.methods.initialize(defaultAccount, registryAddress).send({ from: defaultAccount });

    if (!options.skipWalletCreation) {
        await Wallet.create({ sub, address: userWalletAddress, chainId: ChainId.Hardhat });
        await Wallet.create({ sub: sub2, address: userWalletAddress2, chainId: ChainId.Hardhat });
    }
}

export async function afterAllCallback() {
    await agenda.stop();
    await agenda.purge();
    await agenda.close();
    logger.info(`Closed agenda ${agenda.name}`);

    await db.disconnect();
    logger.info('Truncated and disconnected mongo');

    mockClear();
    logger.info('Cleared mocks');
}
