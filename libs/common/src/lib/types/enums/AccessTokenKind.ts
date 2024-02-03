export enum AccessTokenKind {
    Signup = 'signup',
    Auth = 'authentication',
    PasswordReset = 'password-reset',
    Google = 'google',
    Twitter = 'twitter',
    Github = 'github',
    Discord = 'discord',
    Twitch = 'twitch',
    VerifyEmail = 'verify-email',
    YoutubeView = 'youtube-view',
    YoutubeManage = 'youtube-manage',
    Youtube = 'youtube',
}

export enum OAuthVariant {
    Google = 'google',
    Twitter = 'twitter',
    Discord = 'discord',
    Twitch = 'twitch',
    Github = 'github',
}

export enum OAuthScope {
    GoogleAuth = 'https://www.googleapis.com/auth/userinfo.email openid',
    GoogleYoutubeLike = 'https://www.googleapis.com/auth/youtube.readonly openid',
    GoogleYoutubeSubscribe = 'https://www.googleapis.com/auth/youtube openid',
    TwitterAuth = 'users.read',
    TwitterValidateFollow = 'users.read tweet.read follows.read',
    TwitterValidateLike = 'users.read tweet.read like.read',
    TwitterValidateRepost = 'users.read tweet.read',
    DiscordAuth = 'identify email guilds',
    TwitchAuth = 'user:read:follows user:read:email user:read:broadcast',
    GithubAuth = 'public_repo',
}
