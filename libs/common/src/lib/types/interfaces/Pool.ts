import { TPointReward } from './PointReward';
import { Contract } from 'web3-eth-contract';
import { ChainId } from '../enums';
import { TCollaborator, TAccount, TBrand, TWallet } from '@thxnetwork/types/interfaces';

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

export type TCampaign = {
    _id: string;
    title: string;
    expiryDate: Date;
    address: string;
    chainId: ChainId;
    domain: string;
    participants: number;
    active: boolean;
    progress: number;
    tags: string[];
    logoImgUrl?: string;
    backgroundImgUrl?: string;
    quests: { title: string; description: string; amount: number }[];
    rewards: { title: string; description: string; amount: number }[];
};

export type TPool = {
    _id: string;
    token: string;
    signingSecret: string;
    address: string;
    contract: Contract;
    chainId: ChainId;
    sub: string;
    transactions: string[];
    version?: string;
    variant?: 'defaultDiamond' | 'registry' | 'factory' | 'sharedWallet';
    brand: TBrand;
    wallets: TWallet[];
    settings: TPoolSettings;
    widget: { domain: string; active: boolean };
    collaborators: TCollaborator[];
    owner: TAccount;
    createdAt?: Date;
};

export type TPoolSettings = {
    title: string;
    slug: string;
    description: string;
    startDate: Date;
    endDate?: Date;
    isArchived: boolean;
    isPublished: boolean;
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
