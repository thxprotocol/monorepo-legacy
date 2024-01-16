import { Request, Response } from 'express';
import newrelic from 'newrelic';
import { fromWei } from 'web3-utils';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/types/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { getProvider } from '@thxnetwork/api/util/network';
import { currentVersion } from '@thxnetwork/contracts/exports';
import { license, name, version } from '../../../../package.json';
import { assetsPath } from '@thxnetwork/api/util/path';

function handleError(error: Error) {
    newrelic.noticeError(error);
    logger.error(error);
    return { error: 'invalid response' };
}

async function getNetworkDetails(chainId: ChainId) {
    try {
        const { defaultAccount, web3 } = getProvider(chainId);
        const [balance] = await Promise.all([await web3.eth.getBalance(defaultAccount)]);

        return {
            admin: {
                address: defaultAccount,
                balance: fromWei(balance, 'ether'),
            },
        };
    } catch (error) {
        return handleError(error);
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
        result.mainnet = await getNetworkDetails(ChainId.Polygon);
    }

    result.assetPath = assetsPath;

    res.header('Content-Type', 'application/json').send(JSON.stringify(result, null, 4));
};
