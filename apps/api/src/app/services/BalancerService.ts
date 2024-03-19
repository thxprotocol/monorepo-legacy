import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { POLYGON_RPC } from '../config/secrets';

const sdkConfig = {
    network: Network.POLYGON,
    rpcUrl: POLYGON_RPC,
};
const balancer = new BalancerSDK(sdkConfig);

async function getPricing(balancerPoolId: string) {
    const pool = await balancer.pools.find(balancerPoolId);
    const [usdc, thx] = pool.tokens as unknown as {
        symbol: string;
        balance: number;
        token: { latestUSDPrice: number };
    }[];
    const totalShares = pool.totalShares as unknown as number;
    const thxValue = thx.balance * thx.token.latestUSDPrice;
    const usdcValue = usdc.balance * usdc.token.latestUSDPrice;
    const btpPrice = (thxValue + usdcValue) / totalShares;
    // const balPrice = await balancer.pricing.getSpotPrice(
    //     contractNetworks[ChainId.Polygon].BAL,
    //     contractNetworks[ChainId.Polygon].USDC,
    // );

    return {
        [pool.name]: btpPrice,
        // ['BAL']: balPrice,
        ['BAL']: 6.11,
        [usdc.symbol]: Number(usdc.token.latestUSDPrice),
        [thx.symbol]: Number(thx.token.latestUSDPrice),
    };
}

export default { getPricing };
