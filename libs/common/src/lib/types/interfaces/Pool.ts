import { TPointReward } from './PointReward';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '../enums';
import { TBrand } from '@thxnetwork/types/interfaces';

export enum AccountVariant {
    EmailPassword = 0,
    SSOGoogle = 1,
    SSOTwitter = 2,
    SSOSpotify = 3, // @dev Deprecated
    Metamask = 4,
    SSOGithub = 5,
    SSODiscord = 6,
    SSOTwitch = 7,
}

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
    authenticationMethods: AccountVariant[];
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
