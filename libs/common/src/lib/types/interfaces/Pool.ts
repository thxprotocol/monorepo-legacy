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
    widget: { active: boolean };
};

export type TPoolSettings = {
    title: string;
    isArchived: boolean;
    isWeeklyDigestEnabled: boolean;
    isTwitterSyncEnabled: boolean;
    discordWebhookUrl: string;
    defaults: {
        discordMessage: string;
        conditionalRewards: TPointReward & { hashtag: string };
    };
};

export type TPoolTransfer = {
    sub: string;
    poolId: string;
    token: string;
    expiry: Date;
};

export type TPoolTransferResponse = TPoolTransfer & {
    isExpired: boolean;
    isTransferred: boolean;
    isCopied: boolean;
    url: string;
    now: number;
};
