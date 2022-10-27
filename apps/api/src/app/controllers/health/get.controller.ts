import { Request, Response } from 'express';
import newrelic from 'newrelic';
import { fromWei } from 'web3-utils';

import { diamondFacetAddresses, getContractConfig, getContractFromName } from '@thxnetwork/api/config/contracts';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/api/types/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { getProvider } from '@thxnetwork/api/util/network';
import { currentVersion, diamondVariants } from '@thxnetwork/contracts/exports';

import { license, name, version } from '../../../../../../package.json';

function handleError(error: Error) {
    newrelic.noticeError(error);
    logger.error(error);
    return { error: 'invalid response' };
}

function facetAdresses(chainId: ChainId) {
    const result: Record<string, unknown> = {};

    for (const variant of diamondVariants) {
        result[variant] = diamondFacetAddresses(chainId, variant);
    }

    return result;
}

async function getNetworkDetails(chainId: ChainId) {
    try {
        const { defaultAccount, relayer, web3 } = getProvider(chainId);
        const [balance, feeCollector, feePercentage, pending, failed, mined] = await Promise.all([
            await web3.eth.getBalance(defaultAccount),
            await poolRegistry(chainId).methods.feeCollector().call(),
            await poolRegistry(chainId).methods.feePercentage().call(),
            relayer ? await relayer.list({ status: 'pending' }) : [],
            relayer ? await relayer.list({ status: 'failed' }) : [],
            relayer ? await relayer.list({ status: 'mined' }) : [],
        ]);

        return {
            admin: {
                address: defaultAccount,
                balance: fromWei(balance, 'ether'),
            },
            queue: relayer
                ? {
                      pending: pending.length,
                      failed: failed.length,
                      mined: mined.length,
                  }
                : undefined,
            facets: facetAdresses(chainId),
            factory: getContractConfig(chainId, 'Factory').address,
            registry: getContractConfig(chainId, 'Registry').address,
            feeCollector,
            feePercentage: `${Number(fromWei(feePercentage)) * 100}%`,
        };
    } catch (error) {
        return handleError(error);
    }
}

function poolRegistry(chainId: ChainId) {
    try {
        const { address } = getContractConfig(chainId, 'Registry');
        return getContractFromName(chainId, 'Registry', address);
    } catch (error) {
        return undefined;
    }
}

export const getHealth = async (_req: Request, res: Response) => {
    // #swagger.tags = ['Health']
    const result: any = {
        name,
        version,
        license,
        artifacts: currentVersion,
    };

    if (NODE_ENV !== 'production') {
        result.hardhat = await getNetworkDetails(ChainId.Hardhat);
    } else {
        const [mumbai, polygon] = await Promise.all([
            await getNetworkDetails(ChainId.PolygonMumbai),
            await getNetworkDetails(ChainId.Polygon),
        ]);
        result.testnet = mumbai;
        result.mainnet = polygon;
    }

    res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
};
