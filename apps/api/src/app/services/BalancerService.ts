import axios from 'axios';
import { BalancerSDK, Network } from '@balancer-labs/sdk';
import { BALANCER_POOL_ID, POLYGON_RPC } from '../config/secrets';
import { logger } from '../util/logger';
import { WalletDocument } from '../models';
import { ChainId } from '@thxnetwork/common/enums';
import { getContract } from './ContractService';
import { contractNetworks } from '@thxnetwork/contracts/exports';
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
        this.updatePricesJob();
        this.updateAPRJob();
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
        const abi = [
            {
                constant: true,
                inputs: [
                    {
                        internalType: 'address',
                        name: 'addr',
                        type: 'address',
                    },
                ],
                name: 'gauge_relative_weight',
                outputs: [
                    {
                        internalType: 'uint256',
                        name: '',
                        type: 'uint256',
                    },
                ],
                payable: false,
                stateMutability: 'view',
                type: 'function',
            },
        ];
        const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth');
        const contract = new ethers.Contract('0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD', abi, provider);
        const gaugeRelWeight = Number(
            (await contract.gauge_relative_weight('0x9902913ce5439d667774c8f9526064b2bc103b4a')).toString(),
        );
        const gauge = getContract('BPTGauge', ChainId.Polygon, contractNetworks[ChainId.Polygon].BPTGauge);
        const workingSupply = Number((await gauge.working_supply()).toString());
        const weeklyBALemissions = 102530.48;
        const priceOfBAL = this.pricing['BAL'];
        const pricePerBPT = this.pricing['20USDC-80THX'];
        const apr =
            (((0.4 / (workingSupply + 0.4)) * gaugeRelWeight * weeklyBALemissions * 52 * priceOfBAL) / pricePerBPT) *
            100;

        this.apr = {
            balancer: {
                min: apr,
                max: apr * 2.5,
            },
            thx: {
                min: 0,
                max: 0,
            },
        };

        // bpt gauge locked in veTHX in wei
        const bptGauge = getContract('BPTGauge', ChainId.Polygon, contractNetworks[ChainId.Polygon].BPTGauge);
        this.tvl = (await bptGauge.balanceOf(contractNetworks[ChainId.Polygon].VotingEscrow)).toString();
    }
}

const service = new BalancerService();

export default service;
