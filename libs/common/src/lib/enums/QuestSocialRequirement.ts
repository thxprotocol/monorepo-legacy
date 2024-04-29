export enum QuestSocialRequirement {
    YouTubeLike = 0,
    YouTubeSubscribe = 1,
    TwitterLike = 2,
    TwitterRetweet = 3,
    TwitterFollow = 4,
    DiscordGuildJoined = 5,
    TwitterQuery = 6,
    TwitterLikeRetweet = 7,
    DiscordMessage = 8,
    DiscordMessageReaction = 9,
}

export enum QuestRuleVariant {
    Contains = 'contains',
    Sentiment = 'sentiment',
    MaxAge = 'maxage',
    Author = 'author',
}

export enum QuestRuleSetVariant {
    All = 'all',
    Any = 'any',
}
