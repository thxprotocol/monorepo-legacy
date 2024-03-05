type TTwitterRequestParams = {
    max_results: number;
    pagination_token?: string;
    since_id?: string;
    max_id?: string;
};

type TTwitterLike = {
    _id: string;
    userId: string;
    postId: string;
};

type TTwitterRepost = {
    _id: string;
    userId: string;
    postId: string;
};

type TTwitterFollower = {
    _id: string;
    userId: string;
    targetUserId: string;
};

type TTwitterUserPublicMetrics = {
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    listedCount: number;
    likeCount: number;
};

type TTwitterUser = {
    _id: string;
    userId: string;
    profileImgUrl: string;
    name: string;
    username: string;
    publicMetrics: TTwitterUserPublicMetrics;
};
