import axios from 'axios';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { BALANCER_POOL_ID, POLYGON_RPC } from '../config/secrets';
import { logger } from '../util/logger';
import { WalletDocument } from '../models';

class BalancerService {
    pricing = {};
    balancer = new BalancerSDK({
        network: Network.POLYGON,
        rpcUrl: POLYGON_RPC,
    });

    constructor() {
        this.updatePricesJob();
    }

    async buildJoin(
        wallet: WalletDocument,
        usdcAmountInWei: string,
        thxAmountInWei: string,
        slippage: string,
    ): Promise<any> {
        const pool = await this.balancer.pools.find(BALANCER_POOL_ID);
        const [usdc, thx] = pool.tokens as unknown as {
            address: string;
        }[];

        return pool.buildJoin(wallet.address, [usdc.address, thx.address], [usdcAmountInWei, thxAmountInWei], slippage);
    }

    getPricing() {
        return this.pricing;
    }

    async fetchPrice(symbolIn: string, symbolOut: string) {
        try {
            const { data } = await axios({
                method: 'GET',
                url: `https://api.coinbase.com/v2/exchange-rates?currency=${symbolIn}`,
            });

            return data.data.rates[symbolOut];
        } catch (error) {
            logger.error(error);
            return 0;
        }
    }

    async updatePricesJob() {
        const pool = await this.balancer.pools.find(BALANCER_POOL_ID);
        const [usdc, thx] = pool.tokens as unknown as {
            symbol: string;
            balance: number;
            token: { latestUSDPrice: number };
        }[];
        const totalShares = pool.totalShares as unknown as number;
        const thxValue = thx.balance * thx.token.latestUSDPrice;
        const usdcValue = usdc.balance * usdc.token.latestUSDPrice;
        const btpPrice = (thxValue + usdcValue) / totalShares;
        const balPrice = await this.fetchPrice('BAL', 'USDC');

        this.pricing = {
            '20USDC-80THX': btpPrice,
            'BAL': Number(balPrice),
            'USDC': Number(usdc.token.latestUSDPrice),
            'THX': Number(thx.token.latestUSDPrice),
        };
    }
}

const service = new BalancerService();

export default service;
