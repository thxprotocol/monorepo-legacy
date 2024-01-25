import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { POLYGON_RPC } from '../config/secrets';

const sdkConfig = {
    network: Network.POLYGON,
    rpcUrl: POLYGON_RPC,
};
const balancer = new BalancerSDK(sdkConfig);

async function getSpotPrice(balancerPoolId: string) {
    const pool = await balancer.pools.find(balancerPoolId);
    const [usdc, thx] = pool.tokens;
    const btpPrice =
        Number(usdc.token.latestUSDPrice) * Number(usdc.weight) + Number(thx.token.latestUSDPrice) * Number(thx.weight);
    return {
        [pool.name]: btpPrice,
        [usdc.symbol]: Number(usdc.token.latestUSDPrice),
        [thx.symbol]: Number(thx.token.latestUSDPrice),
    };
}

export default { getSpotPrice };
