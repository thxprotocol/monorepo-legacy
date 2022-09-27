import { Response, Request } from 'express';
import { getProvider } from '@thxnetwork/api/util/network';
import { ChainId } from '@thxnetwork/api/types/enums';
import AssetPoolService from '@thxnetwork/api/services/AssetPoolService';
import WithdrawalService from '@thxnetwork/api/services/WithdrawalService';
import MembershipService from '@thxnetwork/api/services/MembershipService';

const controller = async (_req: Request, res: Response) => {
    // #swagger.tags = ['Metrics']
    const providerTest = getProvider(ChainId.PolygonMumbai);
    const providerMain = getProvider(ChainId.Polygon);

    const metrics = {
        count_asset_pools: {
            mainnet: await AssetPoolService.countByNetwork(ChainId.Polygon),
            testnet: await AssetPoolService.countByNetwork(ChainId.PolygonMumbai),
        },
        count_memberships: {
            mainnet: await MembershipService.countByNetwork(ChainId.Polygon),
            testnet: await MembershipService.countByNetwork(ChainId.PolygonMumbai),
        },
        count_withdrawals: {
            mainnet: await WithdrawalService.countByNetwork(ChainId.Polygon),
            testnet: await WithdrawalService.countByNetwork(ChainId.PolygonMumbai),
        },
        count_transactions: {
            mainnet:
                (await providerMain.web3.eth.getTransactionCount(providerMain.defaultAccount)) +
                (await providerMain.web3.eth.getTransactionCount('0xe583A501276B2E64178512e83972581f98e9290c')), // Including rotated account for accurate total
            testnet:
                (await providerTest.web3.eth.getTransactionCount(providerTest.defaultAccount)) +
                (await providerTest.web3.eth.getTransactionCount('0xe583A501276B2E64178512e83972581f98e9290c')), // Including rotated account for accurate total
        },
    };

    res.json(metrics);
};

export default { controller };
