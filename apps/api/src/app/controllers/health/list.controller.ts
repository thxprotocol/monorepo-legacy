import { Request, Response } from 'express';
import newrelic from 'newrelic';
import { fromWei } from 'web3-utils';
import {
    BAL_ADDRESS,
    BPT_ADDRESS,
    NODE_ENV,
    RF_ADDRESS,
    THX_ADDRESS,
    USDC_ADDRESS,
} from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { getProvider } from '@thxnetwork/api/util/network';
import { license, name, version } from '../../../../package.json';
import { BigNumber, ethers } from 'ethers';
import { contractArtifacts } from '@thxnetwork/api/services/ContractService';

function handleError(error: Error) {
    newrelic.noticeError(error);
    logger.error(error);
    return { error: 'invalid response' };
}

async function getNetworkDetails(chainId: ChainId) {
    try {
        const { defaultAccount, web3, signer } = getProvider(chainId);
        const rfthx = new ethers.Contract(RF_ADDRESS, contractArtifacts['RewardFaucet'].abi, signer);
        const bpt = new ethers.Contract(BPT_ADDRESS, contractArtifacts['BPTToken'].abi, signer);
        const bal = new ethers.Contract(BAL_ADDRESS, contractArtifacts['BalToken'].abi, signer);
        const balances = await Promise.all([
            {
                matic: fromWei(String(await web3.eth.getBalance(defaultAccount)), 'ether'),
                bpt: fromWei(String(await bpt.balanceOf(rfthx.address)), 'ether'),
                bal: fromWei(String(await bal.balanceOf(rfthx.address)), 'ether'),
            },
        ]);
        const supply = await Promise.all([
            fromWei(String(await rfthx.totalTokenRewards(bpt.address)), 'ether'),
            fromWei(String(await rfthx.totalTokenRewards(bal.address)), 'ether'),
        ]);
        const rewards = await Promise.all([
            {
                bpt: (
                    await rfthx.getUpcomingRewardsForNWeeks(bpt.address, 4)
                ).map((amount: BigNumber) => fromWei(String(amount))),
                bal: (
                    await rfthx.getUpcomingRewardsForNWeeks(bal.address, 4)
                ).map((amount: BigNumber) => fromWei(String(amount))),
            },
        ]);

        return {
            addresses: {
                relayer: defaultAccount,
                bpt: bpt.address,
                bal: bal.address,
                thx: THX_ADDRESS,
                usdc: USDC_ADDRESS,
            },
            balances,
            supply,
            rewards,
        };
    } catch (error) {
        return handleError(error);
    }
}

const controller = async (_req: Request, res: Response) => {
    // #swagger.tags = ['Health']
    const result: any = {
        name,
        version,
        license,
    };

    if (NODE_ENV !== 'production') {
        result.hardhat = await getNetworkDetails(ChainId.Hardhat);
    } else {
        result.mainnet = await getNetworkDetails(ChainId.Polygon);
    }

    res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
};

export default { controller };
