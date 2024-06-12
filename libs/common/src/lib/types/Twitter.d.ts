type TTwitterQuery = {
    _id: string;
    createdAt: Date;
    poolId: string;
    query: string;
    frequencyInHours: number;
    posts: TTwitterPost[];
    operators: TTwitterOperators;
    defaults: {
        title: string;
        description: string;
        amount: number;
        isPublished: boolean;
        minFollowersCount: number;
        expiryInDays: number;
        locks: TQuestLock[];
    };
};

type TTwitterRequestParams = {
    max_results: number;
    pagination_token?: string;
    since_id?: string;
    max_id?: string;
    query?: string;
};

type TTwitterLike = {
    _id: string;
    userId: string;
    postId: string;
};

type TTwitterPostPublicMetrics = {
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    bookmarkCount: number;
    impressionCount: number;
};

type TTwitterPostPublicMetricsResponse = {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
    bookmark_count: number;
    impression_count: number;
};

type TTwitterPost = {
    _id: string;
    userId: string;
    postId: string;
    queryId: string;
    text: string;
    publicMetrics: TTwitterPostPublicMetrics;
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

type TTwitterUserResponse = {
    id: string;
    profile_image_url: string;
    name: string;
    username: string;
    public_metrics: {
        followers_count: number;
        following_count: number;
        tweet_count: number;
        listed_count: number;
        like_count: number;
    };
};

type TTwitterOperators = {
    from: string[];
    to: string[];
    text: string[];
    url: string[];
    hashtags: string[];
    mentions: string[];
    media: string | null;
    excludes: string[];
};

type TTwitterMediaResponse = {
    preview_image_url: string;
    width: number;
    height: number;
    type: 'video' | 'photo' | 'animated_gif';
    url: string;
};

type TTwitterPostResponse = {
    id: string;
    author_id: string;
    text: string;
    created_at: number;
    attachments: {
        media_keys: string[];
    };
    public_metrics: TTwitterPostPublicMetricsResponse;
};

type TTwitterPostWithUserAndMedia = TTwitterPostResponse & {
    user: TTwitterUserResponse;
    media: TTwitterMediaResponse[];
};
