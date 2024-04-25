import QuestService from './QuestService';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import TwitterCacheService from './TwitterCacheService';
import { QuestSocialRequirement, QuestVariant } from '@thxnetwork/common/enums';

export default class TwitterQueryService {
    static async run(account: TAccount, query: TTwitterQuery) {
        const posts = await TwitterDataProxy.search(account, query.query);
        for (const post of posts) {
            await this.createQuest(
                query,
                await TwitterCacheService.savePost(post, post.media),
                await TwitterCacheService.saveUser(post.user),
            );
            // TODO Send email to account and inform about created quests
        }
    }

    static async createQuest(query: TTwitterQuery, post: TTwitterPost, user: TTwitterUser) {
        const file = null; // TODO Download buffer for the media first URL and upload with quest
        const quest = await QuestService.create(
            QuestVariant.Twitter,
            query.poolId,
            {
                kind: 'twitter',
                interaction: QuestSocialRequirement.TwitterLikeRetweet,
                title: 'Repost & Like',
                description: '',
                amount: 50,
                locks: [],
                isPublished: false,
                content: post.postId,
                contentMetadata: JSON.stringify({
                    url: `https://twitter.com/${user.username.toLowerCase()}/status/${post.postId}`,
                    username: user.username,
                    name: user.name,
                    text: post.text,
                    minFollowersCount: 5,
                }),
            },
            file,
        );
        console.log(quest);
    }
}
