import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { POLYGON_RPC } from '../config/secrets';

const sdkConfig = {
    network: Network.POLYGON,
    rpcUrl: POLYGON_RPC,
};
const balancer = new BalancerSDK(sdkConfig);

async function getSpotPrice(balancerPoolId: string) {
    const pool = await balancer.pools.find(balancerPoolId);
    const [usdc, thx] = pool.tokens as unknown as {
        symbol: string;
        balance: number;
        token: { latestUSDPrice: number };
    }[];
    const totalShares = pool.totalShares as unknown as number;
    const btpPrice = calculateBPTSpotPrice(usdc, thx, totalShares);

    return {
        [pool.name]: btpPrice,
        [usdc.symbol]: Number(usdc.token.latestUSDPrice),
        [thx.symbol]: Number(thx.token.latestUSDPrice),
    };
}

function calculateBPTSpotPrice(
    usdc: { balance: number; token: { latestUSDPrice: number } },
    thx: { balance: number; token: { latestUSDPrice: number } },
    bptSupply: number,
) {
    const thxValue = thx.balance * thx.token.latestUSDPrice;
    const usdcValue = usdc.balance * usdc.token.latestUSDPrice;
    return (thxValue + usdcValue) / bptSupply;
}

export default { getSpotPrice };
