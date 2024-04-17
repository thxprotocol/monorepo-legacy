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
        const registry = new ethers.Contract(
            contractNetworks[chainId].THXRegistry,
            contractArtifacts['THXRegistry'].abi,
            signer,
        );
        const rdthx = new ethers.Contract(
            contractNetworks[chainId].RewardDistributor,
            contractArtifacts['RewardDistributor'].abi,
            signer,
        );
        const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);
        const bptGauge = new ethers.Contract(
            contractNetworks[chainId].BPTGauge,
            contractArtifacts['BPTGauge'].abi,
            signer,
        );
        const veTHX = new ethers.Contract(
            contractNetworks[chainId].VotingEscrow,
            contractArtifacts['VotingEscrow'].abi,
            signer,
        );
        const bal = new ethers.Contract(contractNetworks[chainId].BAL, contractArtifacts['BAL'].abi, signer);
        // const thx = new ethers.Contract(contractNetworks[chainId].THX, contractArtifacts['THX'].abi, signer);
        // const usdc = new ethers.Contract(contractNetworks[chainId].USDC, contractArtifacts['USDC'].abi, signer);

        const address = {
            registry: registry.address,
            relayer: defaultAccount,
            bptGauge: bptGauge.address,
            bpt: bpt.address,
            bal: bal.address,
            thx: contractNetworks[chainId].THX,
            usdc: contractNetworks[chainId].USDC,
            vault: contractNetworks[chainId].BalancerVault,
        };

        const relayer = await Promise.all([
            {
                matic: fromWei(String(await web3.eth.getBalance(defaultAccount)), 'ether'),
                bpt: fromWei(String(await bpt.balanceOf(defaultAccount)), 'ether'),
                // bptGauge: fromWei(String(await bptGauge.balanceOf(defaultAccount)), 'ether'),
                // bal: fromWei(String(await bal.balanceOf(defaultAccount)), 'ether'),
                // thx: fromWei(String(await thx.balanceOf(defaultAccount)), 'ether'),
                // usdc: fromWei(String(await usdc.balanceOf(defaultAccount)), 'ether'),
            },
        ]);
        const total = fromWei(String(await rfthx.totalTokenRewards(bpt.address)), 'ether');
        const currentBlock = await web3.eth.getBlock('latest');
        const amountStaked = BigNumber.from(String(await bpt.balanceOf(bptGauge.address)));
        const amountSupply = BigNumber.from(String(await bpt.totalSupply()));
        const amountUnstaked = amountSupply.sub(amountStaked);
        const amountLocked = await bptGauge.balanceOf(veTHX.address);

        const metrics = {
            unstaked: fromWei(amountUnstaked.toString(), 'ether'),
            staked: fromWei(amountStaked.toString(), 'ether'),
            locked: fromWei(amountLocked.toString(), 'ether'),
        };
        const getRewards = async (tokenAddress: string, now: string) => {
            const currentWeek = fromWei(String(await rfthx.getTokenWeekAmounts(tokenAddress, now)));
            const upcomingWeeks = (await rfthx.getUpcomingRewardsForNWeeks(tokenAddress, 4)).map((amount: BigNumber) =>
                fromWei(String(amount)),
            );
            return [currentWeek, ...upcomingWeeks];
        };
        const distributor = {
            total,
            balances: await Promise.all([
                {
                    bpt: fromWei(String(await bpt.balanceOf(rfthx.address)), 'ether'),
                    bal: fromWei(String(await bal.balanceOf(rfthx.address)), 'ether'),
                },
            ]),
            rewards: {
                bpt: await getRewards(bpt.address, String(currentBlock.timestamp)),
                bal: await getRewards(bal.address, String(currentBlock.timestamp)),
            },
        };
        const splitter = new ethers.Contract(
            contractNetworks[chainId].THXPaymentSplitter,
            contractArtifacts['THXPaymentSplitter'].abi,
            signer,
        );

        return {
            blockTime: new Date(Number(currentBlock.timestamp) * 1000),
            registry: {
                payoutRate: BigNumber.from(await registry.getPayoutRate())
                    .div(100)
                    .toString(),
                payee: await registry.getPayee(),
            },
            test: {
                rate: (await splitter.rates('0x029E2d4D2b6938c92c48dbf422a4e500425a08D8')).toString(),
                balance: (await splitter.balanceOf('0x029E2d4D2b6938c92c48dbf422a4e500425a08D8')).toString(),
            },
            address,
            relayer,
            metrics,
            distributor,
        };
    } catch (error) {
        return handleError(error);
    }
}

const controller = async (req: Request, res: Response) => {
    const result = {
        name,
        version,
        license,
        networks: {},
    };

    if (NODE_ENV !== 'production') {
        result.networks[ChainId.Hardhat] = await getNetworkDetails(ChainId.Hardhat);
    } else {
        result.networks[ChainId.Polygon] = await getNetworkDetails(ChainId.Polygon);
    }

    res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
};

export default { controller };
