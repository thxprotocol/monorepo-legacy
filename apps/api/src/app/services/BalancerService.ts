import axios from 'axios';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { BALANCER_POOL_ID, ETHEREUM_RPC, HARDHAT_RPC, NODE_ENV, POLYGON_RPC } from '../config/secrets';
import { logger } from '../util/logger';
import { WalletDocument } from '../models';
import { ChainId } from '@thxnetwork/common/enums';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { BigNumber, ethers } from 'ethers';

class BalancerService {
    pricing = {};
    apr = {
        balancer: {
            min: 0,
            max: 0,
        },
        thx: {
            min: 0,
            max: 0,
        },
    };
    tvl = 0;
    rewards = {
        [ChainId.Hardhat]: { bal: '0', bpt: '0' },
        [ChainId.Polygon]: { bal: '0', bpt: '0' },
    };
    schedule = {
        [ChainId.Hardhat]: { bal: [], bpt: [] },
        [ChainId.Polygon]: { bal: [], bpt: [] },
    };
    balancer = new BalancerSDK({
        network: Network.POLYGON,
        rpcUrl: POLYGON_RPC,
    });

    constructor() {
        this.updatePricesJob().then(() => {
            this.updateMetricsJob();
        });
    }

    async buildJoin(
        wallet: WalletDocument,
        usdcAmountInWei: string,
        thxAmountInWei: string,
        slippage: string,
    ): Promise<JoinPoolAttributes> {
        const pool = await this.balancer.pools.find(BALANCER_POOL_ID);
        const [usdc, thx] = pool.tokens as {
            address: string;
        }[];

        return pool.buildJoin(
            wallet.address,
            [usdc.address, thx.address],
            [usdcAmountInWei, thxAmountInWei],
            slippage,
        ) as JoinPoolAttributes;
    }

    getPricing() {
        return this.pricing;
    }

    getMetrics(wallet: WalletDocument) {
        return {
            apr: this.apr,
            tvl: this.tvl,
            rewards: this.rewards[wallet.chainId],
            schedule: this.schedule[wallet.chainId],
        };
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

    async updateMetricsJob() {
        // Balancer Gauge contracts on Ethereum
        const ethereumProvider = new ethers.providers.JsonRpcProvider(ETHEREUM_RPC);
        const gaugeControllerAddress = contractNetworks[ChainId.Ethereum].BalancerGaugeController;
        const gaugeController = new ethers.Contract(
            gaugeControllerAddress,
            contractArtifacts.BalancerGaugeController.abi,
            ethereumProvider,
        );
        const rootGaugeAddress = contractNetworks[ChainId.Ethereum].BalancerRootGauge;
        // Balancer Gauge on Polygon
        const polygonProvider = new ethers.providers.JsonRpcProvider(POLYGON_RPC);
        const gaugeAddress = contractNetworks[ChainId.Polygon].BPTGauge;
        const gauge = new ethers.Contract(gaugeAddress, contractArtifacts.BPTGauge.abi, polygonProvider);
        // veTHX contract on Polygon
        const veTHXAddress = contractNetworks[ChainId.Polygon].VotingEscrow;

        // APR formula inputs
        const gaugeRelWeight = Number((await gaugeController.gauge_relative_weight(rootGaugeAddress)).toString());
        const workingSupply = Number((await gauge.working_supply()).toString());
        const weeklyBALemissions = 102530.48;
        const priceOfBAL = this.pricing['BAL'];
        const pricePerBPT = this.pricing['20USDC-80THX'];

        // Calculate balancer APR
        const apr = this.calculateAPR(workingSupply, gaugeRelWeight, weeklyBALemissions, priceOfBAL, pricePerBPT);
        const balancer = { min: apr, max: apr * 2.5 };
        // TODO Calculate THX APR
        const thx = { min: 0, max: 0 };
        this.apr = { balancer, thx };

        // Amount of bpt-gauge locked in veTHX in wei
        const tvl = (await gauge.balanceOf(veTHXAddress)).toString();
        this.tvl = tvl;

        for (const chainId of [ChainId.Hardhat, ChainId.Polygon]) {
            if (NODE_ENV === 'production' && chainId === ChainId.Hardhat) continue;
            const { rewards, schedule } = await this.getRewards(chainId);
            this.rewards[chainId] = rewards;
            this.schedule[chainId] = schedule;
        }
    }

    calculateAPR(
        workingSupply: number,
        gaugeRelWeight: number,
        weeklyBALemissions: number,
        priceOfBAL: number,
        pricePerBPT: number,
    ) {
        // APR formula as per
        // https://docs.balancer.fi/reference/vebal-and-gauges/apr-calculation.html
        return (
            (((0.4 / (workingSupply + 0.4)) * gaugeRelWeight * weeklyBALemissions * 52 * priceOfBAL) / pricePerBPT) *
            100
        );
    }

    async getRewards(chainId: ChainId) {
        const rpcMap = {
            [ChainId.Hardhat]: HARDHAT_RPC,
            [ChainId.Polygon]: POLYGON_RPC,
        };
        const { BAL, BPT, RewardFaucet } = contractNetworks[chainId];
        const provider = new ethers.providers.JsonRpcProvider(rpcMap[chainId]);
        const rewardFaucet = new ethers.Contract(RewardFaucet, contractArtifacts['RewardFaucet'].abi, provider);
        const amountOfWeeks = '4';
        const [balSchedule, bptSchedule] = await Promise.all(
            [BAL, BPT].map(async (tokenAddress: string) => {
                const upcoming = await rewardFaucet.getUpcomingRewardsForNWeeks(tokenAddress, amountOfWeeks);
                return upcoming.map((amount: BigNumber) => amount.toString());
            }),
        );
        const [balTotal, bptTotal] = await Promise.all(
            [BAL, BPT].map(async (tokenAddress) => (await rewardFaucet.totalTokenRewards(tokenAddress)).toString()),
        );

        return { schedule: { bal: balSchedule, bpt: bptSchedule }, rewards: { bal: balTotal, bpt: bptTotal } };
    }
}

const service = new BalancerService();

export default service;
