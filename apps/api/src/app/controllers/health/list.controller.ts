import { Request, Response } from 'express';
import newrelic from 'newrelic';
import { fromWei } from 'web3-utils';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/common/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { getProvider } from '@thxnetwork/api/util/network';
import { license, name, version } from '../../../../package.json';
import { BigNumber, ethers } from 'ethers';
import { contractArtifacts } from '@thxnetwork/api/services/ContractService';
import { contractNetworks } from '@thxnetwork/contracts/exports';

function handleError(error: Error) {
    newrelic.noticeError(error);
    logger.error(error);
    return { error: 'invalid response' };
}

async function getNetworkDetails(chainId: ChainId) {
    try {
        const { defaultAccount, web3, signer } = getProvider(chainId);
        const rfthx = new ethers.Contract(
            contractNetworks[chainId].RewardFaucet,
            contractArtifacts['RewardFaucet'].abi,
            signer,
        );
        const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPTToken'].abi, signer);
        const bal = new ethers.Contract(contractNetworks[chainId].BAL, contractArtifacts['BalToken'].abi, signer);
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
                usdc: contractNetworks[chainId].USDC,
            },
            balances,
            supply,
            rewards,
        };
    } catch (error) {
        return handleError(error);
    }
}

const controller = async (req: Request, res: Response) => {
    logger.info(`IP Forwarded For: ${req.headers['x-forwarded-for']}`);
    logger.info(`IP: ${req.ip}`);

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
