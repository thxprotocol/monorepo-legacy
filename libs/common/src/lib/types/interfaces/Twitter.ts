import { QuestSocialRequirement } from '../enums';

export type TTwitterCursor = {
    _id: string;
    requirement: QuestSocialRequirement;
    postId: string;
    newestId: string;
    oldestId: string;
};

export type TTwitterLike = {
    _id: string;
    userId: string;
    postId: string;
};

export type TTwitterRepost = {
    _id: string;
    userId: string;
    postId: string;
};

export type TTwitterUser = {
    _id: string;
    userId: string;
    profileImgUrl: string;
    name: string;
    username: string;
    publicMetrics: {
        followersCount: number;
        followingCount: number;
        tweetCount: number;
        listedCount: number;
        likeCount: number;
    };
};
