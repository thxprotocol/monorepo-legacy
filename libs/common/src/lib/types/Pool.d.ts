type TCampaign = {
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

type TPool = {
    _id: string;
    safeAddress: string;
    guilds: TDiscordGuild[];
    rank: number;
    token: string;
    signingSecret: string;
    contract: Contract;
    chainId: ChainId;
    sub: string;
    transactions: string[];
    version?: string;
    variant?: 'defaultDiamond' | 'registry' | 'factory' | 'sharedWallet';
    eventNames: string[];
    webhooks: TWebhook[];
    brand: TBrand;
    // wallets: TWallet[];
    settings: TPoolSettings;
    widget: { domain: string; active: boolean };
    collaborators: TCollaborator[];
    identities: TIdentity[];
    owner: TAccount;
    safe: WalletDocument;
    campaignURL: string;
    createdAt: Date;
    trialEndsAt: Date;
    balance: string;
    author: {
        username: string;
    };
    participantCount: number;
};

type TPoolSettings = {
    title: string;
    slug: string;
    description: string;
    leaderboardInWeeks: number;
    isPublished: boolean;
    isWeeklyDigestEnabled: boolean;
    isTwitterSyncEnabled: boolean;
    authenticationMethods: AccountVariant[];
};

type TPoolTransfer = {
    sub: string;
    poolId: string;
    token: string;
    expiry: Date;
};

type TPoolTransferResponse = TPoolTransfer & {
    isExpired: boolean;
    isTransferred: boolean;
    isCopied: boolean;
    url: string;
    now: number;
};

type IPoolAnalytic = {
    _id: string;
    erc20Perks: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    erc721Perks: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    customRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    couponRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    discordRoleRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];

    //
    dailyRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    referralRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    pointRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    milestoneRewards: [
        {
            day: string;
            totalAmount: number;
        },
    ];
    web3Quests: [
        {
            day: string;
            totalAmount: number;
        },
    ];
};

type IPoolAnalyticMetrics = {
    _id: string;
    participantActiveCount: number;
    participantCount: number;
    subscriptionCount: number;
    dailyQuest: PoolMetric;
    socialQuest: PoolMetric;
    inviteQuest: PoolMetric;
    customQuest: PoolMetric;
    web3Quest: PoolMetric;
    gitcoinQuest: PoolMetric;
    coinReward: PoolMetric;
    nftReward: PoolMetric;
    customReward: PoolMetric;
    couponReward: PoolMetric;
    discordRoleReward: PoolMetric;
};
type IPools = {
    [id: string]: TPool;
};

type IPoolAnalytics = {
    [id: string]: IPoolAnalytic;
};

type IPoolAnalyticsLeaderBoard = {
    [id: string]: IPoolAnalyticLeaderBoard[];
};

type IPoolAnalyticsMetrics = {
    [id: string]: IPoolAnalyticMetrics;
};
