import { AccountPlanType, Goal, Role } from './enums';

export const planPricingMap = {
    [AccountPlanType.Lite]: {
        subscriptionLimit: 100,
        costSubscription: 1900,
        costPerUnit: 8,
    },
    [AccountPlanType.Premium]: {
        subscriptionLimit: 5000,
        costSubscription: 48900,
        costPerUnit: 5,
    },
};

export const GITHUB_API_ENDPOINT = 'https://api.github.com';
export const TWITTER_API_ENDPOINT = 'https://api.twitter.com/2';
export const GOOGLE_API_ENDPOINT = 'https://www.googleapis.com';
export const DISCORD_API_ENDPOINT = 'https://discord.com/api/v10';
export const TWITCH_API_ENDPOINT = 'https://api.twitch.tv/helix';
export const DEFAULT_ELEMENTS = {
    btnBg: {
        label: 'Button',
        color: '#5942c1',
    },
    btnText: {
        label: 'Button Text',
        color: '#FFFFFF',
    },
    text: {
        label: 'Text',
        color: '#FFFFFF',
    },
    bodyBg: {
        label: 'Background',
        color: '#241956',
    },
    cardBg: {
        label: 'Card',
        color: '#31236d',
    },
    cardText: {
        label: 'Card Text',
        color: '#FFFFFF',
    },
    navbarBg: {
        label: 'Navigation',
        color: '#31236d',
    },
    navbarBtnBg: {
        label: 'Navigation Button',
        color: '#5942c1',
    },
    navbarBtnText: {
        label: 'Navigation Button Text',
        color: '#FFFFFF',
    },
    launcherBg: {
        label: 'Launcher',
        color: '#5942c1',
    },
    launcherIcon: {
        label: 'Launcher Icon',
        color: '#ffffff',
    },
};

export const DEFAULT_COLORS = {
    accent: {
        label: 'Accent',
        color: '#98D80D',
    },
    success: {
        label: 'Success',
        color: '#28a745',
    },
    warning: {
        label: 'Warning',
        color: '#ffe500',
    },
    danger: {
        label: 'Danger',
        color: '#dc3545',
    },
    info: {
        label: 'Info',
        color: '#17a2b8',
    },
};

export const roleLabelMap = {
    [Role.None]: 'Select a role',
    [Role.GrowthHacker]: 'Growth Hacker',
    [Role.Marketer]: 'Marketer',
    [Role.CommunityManager]: 'Community Manager',
    [Role.Developer]: 'Developer',
    [Role.Other]: 'Other',
};

export const goalLabelMap = {
    [Goal.Reward]: 'Reward users in my game or app',
    [Goal.Retain]: 'Retain players or members',
    [Goal.Referral]: 'Set up referrals',
    [Goal.Social]: 'Integrate rewards in social channels',
    [Goal.Mint]: 'Mint tokens',
};

export const contentRewards = {
    'coin-reward': {
        tag: 'Coin Reward',
        title: 'Cashbacks with Coins',
        description: 'Import your own ERC20 smart contract and let users redeem points for coins.',
        list: ['Provide tangible value', 'Boost user retention', 'Incentivize spending'],
        docsUrl: 'https://docs.thx.network/rewards/coins',
        icon: 'fas fa-coins', // Suggested icon for coins
        color: '#FFD700', // Suggested color for coins (Gold)
    },
    'nft-reward': {
        tag: 'NFT Reward',
        title: 'Exclusive NFTs',
        description: 'Import your own ERC721 or ERC1155 smart contract and let users redeem points for exclusive NFTs.',
        list: ['Offer unique collectibles', 'Enhance user engagement', 'Drive interest in NFTs'],
        docsUrl: 'https://docs.thx.network/rewards/nft',
        icon: 'fas fa-gem', // Suggested icon for gems or precious items
        color: '#9370DB', // Suggested color for NFTs (Light Purple)
    },
    'custom-reward': {
        tag: 'Custom Reward',
        title: 'Flexible Rewards',
        description: 'Use inbound webhooks to reward users with custom features in your application.',
        list: ['Tailor rewards to user needs', 'Enhance user satisfaction', 'Drive app adoption'],
        docsUrl: 'https://docs.thx.network/rewards',
        icon: 'fas fa-cogs', // Suggested icon for customization or settings
        color: '#808080', // Suggested color for customization (Gray)
    },
    'discord-role-reward': {
        tag: 'Discord Role Reward',
        title: 'Exclusive Discord Roles',
        description:
            'Grant users the ability to redeem points for exclusive Discord roles within your community server.',
        list: ['Promote community status', 'Encourage active participation', 'Facilitate social interaction'],
        docsUrl: 'https://docs.thx.network/rewards/discord-role',
        icon: 'fab fa-discord', // Suggested icon for shield or protection
        color: '#7289DA', // Suggested color for Discord roles (Discord Blue)
    },
    'qr-codes': {
        tag: 'QR Codes',
        title: 'Offline Reward Distribution',
        description: 'Use QR codes to distribute rewards in offline environments.',
        list: ['Expand reach to offline users', 'Facilitate in-person engagement', 'Enhance brand recognition'],
        docsUrl: 'https://docs.thx.network',
        icon: 'fas fa-qrcode', // Suggested icon for QR codes
        color: '#000000', // Suggested color for QR codes (Black)
    },
};

export const contentQuests = {
    'steam-quest': {
        tag: 'Steam Quest',
        icon: 'fab fa-steam',
        title: 'Unlock Steam engagement',
        description: 'Embark on a gaming journey by purchasing, wishlisting games, and earning Steam achievements.',
        list: ['Buy a game on Steam', 'Wishlist a game on Steam', 'Earn a Steam achievement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/daily-quests',
        color: '#171d25',
    },
    'twitter-quest': {
        tag: 'Twitter Quest',
        icon: 'fab fa-twitter',
        title: 'Boost your Twitter presence',
        description: 'Engage your audience on Twitter by creating exciting quests that encourage retweets and likes.',
        list: ['Increase followers', 'Enhance brand recognition', 'Foster community engagement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/social-quests',
        color: '#1B95E0',
    },
    'daily-quest': {
        tag: 'Daily Quest',
        title: 'Boost user engagement',
        icon: 'fas fa-calendar',
        description: 'Provide daily incentives for returning to your website.',
        list: ['Encourage regular visits', 'Enhance user loyalty', 'Foster community growth'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/daily-quests',
        color: '#4CAF50',
    },
    'custom-quest': {
        tag: 'Custom Quest',
        icon: 'fas fa-trophy',
        title: 'Seamless integration',
        description: 'Integrate quests with ease using webhooks to reward important achievements in your application.',
        list: ['Tailor rewards to your app', 'Streamline integration', 'Enhance user experience'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/custom-quests',
        color: '#9370DB',
    },
    'youtube-quest': {
        tag: 'Youtube Quest',
        icon: 'fab fa-youtube',
        title: 'Expand your YouTube presence',
        description:
            'Amplify your presence on YouTube by creating quests that encourage likes, shares, and subscriptions.',
        list: ['Increase video views', 'Boost channel subscribers', 'Enhance YouTube community engagement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/social-quests',
        color: '#FF0000',
    },
    'invite-quest': {
        tag: 'Invite Quest',
        icon: 'fas fa-comments',
        title: 'Drive user acquisition',
        description: 'Empower your players to earn rewards for referrals.',
        list: ['Expand your user base', 'Lower acquisition costs', 'Strengthen player networks'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/referral-quests',
        color: '#FFA500',
    },
    'discord-quest': {
        tag: 'Discord Quest',
        icon: 'fab fa-discord',
        title: 'Strengthen your Discord community',
        description:
            'Create quests on Discord to promote community interactions and build a strong, engaged user base.',
        list: ['Grow your Discord server', 'Enhance community participation', 'Boost server activity'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
        color: '#5865F2',
    },
    'web3-quest': {
        tag: 'Web3 Quest',
        icon: 'fab fa-ethereum',
        title: 'Empower with Web3 rewards',
        description: "Reward users' coin balance or NFT ownership using smart contracts.",
        list: ['Leverage blockchain technology', 'Enhance user ownership', 'Facilitate decentralized rewards'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
        color: '#3C3C3D',
    },
    'gitcoin-quest': {
        tag: 'Gitcoin Quest',
        icon: 'fas fa-fingerprint',
        title: 'Use Gitcoin Passport for sybil resistance',
        description: 'Use this quest to verify if wallets are owned by real humans.',
        list: ['Increase Sybil Resistance', 'Gitcoin Unique Humanity Scorer', 'Tap into new ecosystems'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
        color: '#3498db',
    },
    'webhook-quest': {
        tag: 'Webhook Quest',
        icon: 'fas fa-globe',
        title: 'Use your own API endpoints',
        description: 'Use your API endpoint to validate quests for account identities.',
        list: ['Track real engagement', 'Your own validation method', 'Account identities'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
        color: '#3498db',
    },
};
