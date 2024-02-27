import { Request, Response } from 'express';
import newrelic from 'newrelic';
import { fromWei } from 'web3-utils';
import { BPT_ADDRESS, NODE_ENV } from '@thxnetwork/api/config/secrets';
import { ChainId } from '@thxnetwork/common/enums';
import { logger } from '@thxnetwork/api/util/logger';
import { getProvider } from '@thxnetwork/api/util/network';
import { license, name, version } from '../../../../package.json';

function handleError(error: Error) {
    newrelic.noticeError(error);
    logger.error(error);
    return { error: 'invalid response' };
}

async function getNetworkDetails(chainId: ChainId) {
    try {
        const { defaultAccount, web3 } = getProvider(chainId);
        const balance = await web3.eth.getBalance(defaultAccount);

        return {
            btp: BPT_ADDRESS,
            admin: {
                address: defaultAccount,
                balance: fromWei(balance, 'ether'),
            },
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
