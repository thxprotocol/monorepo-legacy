export enum AccountPlanType {
    Free = 0,
    Basic = 1,
    Premium = 2,
}

export interface IAccount {
    sub: string;
    privateKey: string;
    address: string;
    firstName: string;
    lastName: string;
    company: string;
    plan: AccountPlanType;
    email?: string;
}
export interface IAccountUpdates {
    address: string;
    googleAccessToken: string;
    youtubeViewAccessToken: string;
    youtubeManageAccessToken: string;
}

export interface IYoutube {
    channels: unknown;
    videos: unknown;
}

export interface ITwitter {
    tweets: unknown;
    users: unknown;
}

export interface IDiscord {
    guilds: unknown[];
}

export interface IMember {
    poolAddress: string;
    memberId: number;
    address: string;
}

export type IMemberByPage = { [page: number]: IMember[] };
