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
        const bpt = new ethers.Contract(contractNetworks[chainId].BPT, contractArtifacts['BPT'].abi, signer);
        const bptGauge = new ethers.Contract(
            contractNetworks[chainId].BPTGauge,
            contractArtifacts['BPTGauge'].abi,
            signer,
        );
        // const veTHX = new ethers.Contract(
        //     contractNetworks[chainId].VotingEscrow,
        //     contractArtifacts['VotingEscrow'].abi,
        //     signer,
        // );
        const bal = new ethers.Contract(contractNetworks[chainId].BAL, contractArtifacts['BAL'].abi, signer);
        const thx = new ethers.Contract(contractNetworks[chainId].THX, contractArtifacts['THX'].abi, signer);
        const usdc = new ethers.Contract(contractNetworks[chainId].USDC, contractArtifacts['USDC'].abi, signer);

        const address = {
            relayer: defaultAccount,
            bptGauge: bptGauge.address,
            bpt: bpt.address,
            bal: bal.address,
            thx: contractNetworks[chainId].THX,
            usdc: contractNetworks[chainId].USDC,
        };

        const ve = await Promise.all([]);

        const relayer = await Promise.all([
            {
                matic: fromWei(String(await web3.eth.getBalance(defaultAccount)), 'ether'),
                gauge: fromWei(String(await bptGauge.balanceOf(defaultAccount)), 'ether'),
                bpt: fromWei(String(await bpt.balanceOf(defaultAccount)), 'ether'),
                bal: fromWei(String(await bal.balanceOf(defaultAccount)), 'ether'),
                thx: fromWei(String(await thx.balanceOf(defaultAccount)), 'ether'),
                usdc: fromWei(String(await usdc.balanceOf(defaultAccount)), 'ether'),
            },
        ]);

        const gauge = {
            staked: fromWei(String(await bpt.balanceOf(bptGauge.address)), 'ether'),
        };

        const distributor = {
            balances: await Promise.all([
                {
                    bpt: fromWei(String(await bpt.balanceOf(rfthx.address)), 'ether'),
                    bal: fromWei(String(await bal.balanceOf(rfthx.address)), 'ether'),
                },
            ]),
            rewards: await Promise.all([
                {
                    bpt: (
                        await rfthx.getUpcomingRewardsForNWeeks(bpt.address, 4)
                    ).map((amount: BigNumber) => fromWei(String(amount))),
                    bal: (
                        await rfthx.getUpcomingRewardsForNWeeks(bal.address, 4)
                    ).map((amount: BigNumber) => fromWei(String(amount))),
                },
            ]),
        };

        const currentBlock = await web3.eth.getBlock('latest');

        return {
            blockTime: new Date(Number(currentBlock.timestamp) * 1000),
            address,
            ve,
            relayer,
            gauge,
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

    if (NODE_ENV === 'production') {
        result.networks[ChainId.Polygon] = await getNetworkDetails(ChainId.Polygon);
    }
    result.networks[ChainId.Hardhat] = await getNetworkDetails(ChainId.Hardhat);

    res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
};

export default { controller };
