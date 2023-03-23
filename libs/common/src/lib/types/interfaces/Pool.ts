import { TPointReward } from './PointReward';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '../enums';
import { TBrand } from '@thxnetwork/types/interfaces';

export type TPool = {
    _id: string;
    address: string;
    contract: Contract;
    chainId: ChainId;
    sub: string;
    transactions: string[];
    version?: string;
    variant?: 'defaultDiamond' | 'registry' | 'factory' | 'sharedWallet';
    brand: TBrand;
    settings: TPoolSettings;
};

export type TPoolSettings = {
    title: string;
    isArchived: boolean;
    isWeeklyDigestEnabled: boolean;
    isTwitterSyncEnabled: boolean;
    discordWebhookUrl?: string;
    defaults: {
        conditionalRewards: TPointReward;
    };
};
