export type TTwitterRequestParams = {
    max_results: number;
    pagination_token?: string;
    since_id?: string;
    max_id?: string;
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

export type TTwitterFollower = {
    _id: string;
    userId: string;
    targetUserId: string;
};

export type TTwitterUserPublicMetrics = {
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    listedCount: number;
    likeCount: number;
};

export type TTwitterUser = {
    _id: string;
    userId: string;
    profileImgUrl: string;
    name: string;
    username: string;
    publicMetrics: TTwitterUserPublicMetrics;
};
