export enum ChannelType {
    None = 0,
    Google = 1,
    Twitter = 2,
    Spotify = 3,
    Github = 4,
}

export enum ChannelAction {
    YouTubeLike = 0,
    YouTubeSubscribe = 1,
    TwitterLike = 2,
    TwitterRetweet = 3,
    TwitterFollow = 4,
    SpotifyUserFollow = 5,
    SpotifyPlaylistFollow = 6,
    SpotifyTrackPlaying = 7,
    SpotifyTrackSaved = 8,
    SpotifyTrackRecent = 9,
    GithubPullRequestMerged = 10,
    GithubIssueCreated = 11,
    GithubIssueCommented = 12,
}
