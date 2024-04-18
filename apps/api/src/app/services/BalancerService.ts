import axios from 'axios';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { BALANCER_POOL_ID, ETHEREUM_RPC, POLYGON_RPC } from '../config/secrets';
import { logger } from '../util/logger';
import { WalletDocument } from '../models';
import { ChainId } from '@thxnetwork/common/enums';
import { getContract } from './ContractService';
import { contractArtifacts, contractNetworks } from '@thxnetwork/contracts/exports';
import { ethers } from 'ethers';

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
    balancer = new BalancerSDK({
        network: Network.POLYGON,
        rpcUrl: POLYGON_RPC,
    });

    constructor() {
        this.updatePricesJob().then(() => {
            this.updateAPRJob();
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

    getAPR() {
        return { apr: this.apr, tvl: this.tvl };
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

    async updateAPRJob() {
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
}

const service = new BalancerService();

export default service;
