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
    events: string[];
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
};

type TPoolSettings = {
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
    galachainPrivateKey: string;
    defaults: {
        discordMessage: string;
        conditionalRewards: TQuestSocial & { hashtag: string };
    };
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
