import { Goal, Role } from './enums';

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
