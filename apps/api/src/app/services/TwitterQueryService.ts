import QuestService from './QuestService';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import TwitterCacheService from './TwitterCacheService';
import { QuestSocialRequirement, QuestVariant } from '@thxnetwork/common/enums';
import MailService from './MailService';
import { Pool, QuestSocial, TwitterQuery } from '../models';
import AccountProxy from '../proxies/AccountProxy';

export default class TwitterQueryService {
    static async searchJob() {
        const queries = await TwitterQuery.find();
        const poolIds = queries.map((query) => query.poolId);
        const pools = await Pool.find({ _id: { $in: poolIds } });
        const subs = pools.map((pool) => pool.sub);
        const accounts = await AccountProxy.find({ subs });

        for (const query of queries) {
            const pool = pools.find((pool) => pool._id === query.poolId);
            const account = accounts.find((account) => account.sub === pool.sub);

            await this.search(account, query);
        }
    }

    static async search(account: TAccount, query: TTwitterQuery) {
        const posts = await TwitterDataProxy.search(account, query.query);

        // Filter out the posts that already have a quest
        const postIds = posts.map((post) => post.id);
        const quests = await QuestSocial.find({ poolId: query.poolId, content: { $in: postIds } });
        const postsWithoutQuest = posts.filter((post) => {
            return !quests.some((quest) => quest.content === post.id);
        });

        // Iterate over posts and create quests
        for (const post of postsWithoutQuest) {
            await this.createQuest(
                query,
                await TwitterCacheService.savePost(post, post.media),
                await TwitterCacheService.saveUser(post.user),
            );
        }

        // Send notification to campaign owner if > 0 posts without quest
        if (postsWithoutQuest.length) {
            await this.sendMail(account, posts);
        }
    }

    static async sendMail(account: TAccount, posts: TTwitterPostWithUserAndMedia[]) {
        await MailService.send(
            account.email,
            '👀 New matches for your query!',
            `<p>Hi!</p>
            <p>We found matches for your X query! Check the suggested quests in your <a href="https://dashboard.thx.network">campaign dashboard</a></p>
            ${posts
                .map(
                    (post) =>
                        `<div><strong>${post.user.username}</strong> <span>(${
                            post.public_metrics.impression_count
                        } views)</span></div>
                    <div>${post.text.substring(0, 100)}... <a href="https://x.com/${post.user.username}/status/${
                            post.id
                        }" target="_blank">
                    View Post    
                    </a></div>`,
                )
                .join('<br />')}
            `,
        );
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
