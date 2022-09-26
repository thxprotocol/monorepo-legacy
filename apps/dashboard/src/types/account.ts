export enum AccountPlanType {
    Free = 0,
    Basic = 1,
    Premium = 2,
}

export interface IAccount {
    privateKey: string;
    address: string;
    youtube: any;
    firstName: string;
    lastName: string;
    company: string;
    plan: AccountPlanType;
}
export interface IAccountUpdates {
    address: string;
    googleAccessToken: string;
}

export interface IYoutube {
    channels: any;
    videos: any;
}

export interface ITwitter {
    tweets: any;
    users: any;
}

export interface ISpotify {
    playlists: any;
    items: any;
    users: any;
}

export interface IMember {
    poolAddress: string;
    memberId: number;
    address: string;
}

export type IMemberByPage = { [page: number]: IMember[] };
