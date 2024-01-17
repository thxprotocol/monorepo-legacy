import {
    AccessTokenKind,
    QuestVariant,
    RewardConditionInteraction,
    RewardConditionPlatform,
} from '@thxnetwork/types/enums';
import { TAccount } from '@thxnetwork/types/interfaces';
import { AssetPool } from '../models/AssetPool';
import { PointReward } from '../models/PointReward';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import QuestService from '../services/QuestService';
import { logger } from '../util/logger';
import { DASHBOARD_URL } from '../config/secrets';

export async function createTwitterQuests() {
    for await (const pool of AssetPool.find({ 'settings.isTwitterSyncEnabled': true })) {
        try {
            const { isAuthorized } = await TwitterDataProxy.getTwitter(pool.sub);
            if (!isAuthorized) {
                logger.error(`Started autoquest but ${pool.sub} has no Twitter access.`);
                continue;
            }
            const { hashtag, title, description, amount, locks, isPublished } =
                pool.settings.defaults.conditionalRewards;

            const tweets = await TwitterDataProxy.searchTweets(pool.sub, `#${hashtag}`);
            if (!tweets.length) continue;
            logger.info(`Found tweets matching the hashtag in the last 7 days!`);
            logger.info(JSON.stringify(tweets));

            const promises = tweets.map(async (tweet: any) => {
                const isExistingQuest = await PointReward.exists({
                    poolId: String(pool._id),
                    content: tweet.id,
                });
                return { ...tweet, isExistingQuest };
            });
            const recentTweets = await Promise.all(promises);
            logger.info(`Found ${recentTweets.length} posts for ${pool.sub} in ${pool.settings.title}`);

            const newTweets = recentTweets.filter((tweet) => !tweet.isExistingQuest);
            if (!newTweets.length) {
                logger.info(`Found no new autoquests for ${pool.sub} in ${pool.settings.title}`);
                continue;
            }
            logger.info(`Found ${newTweets.length} new autoquest for ${pool.sub} in ${pool.settings.title}`);

            const account: TAccount = await AccountProxy.getById(pool.sub);
            const twitterAccount = account.connectedAccounts.find((token) => token.kind === AccessTokenKind.Twitter);
            if (!twitterAccount) {
                logger.error(`Could not find Twitter accounts for ${pool.sub} in ${pool.settings.title}`);
                continue;
            }

            const quests = await Promise.all(
                newTweets.map(async (tweet) => {
                    try {
                        const contentMetadata = JSON.stringify({
                            url: `https://twitter.com/${twitterAccount.metadata.username}/status/${tweet.id}`,
                            username: twitterAccount.metadata.username,
                            text: tweet.text,
                        });
                        return await QuestService.create(QuestVariant.Twitter, pool._id, {
                            index: 0,
                            title,
                            description,
                            amount,
                            locks,
                            platform: RewardConditionPlatform.Twitter,
                            interaction: RewardConditionInteraction.TwitterLikeRetweet,
                            content: tweet.id,
                            contentMetadata,
                            isPublished,
                        });
                    } catch (error) {
                        logger.error(error.message);
                    }
                }),
            );

            const subject = `Created ${quests.length} Twitter Quest${quests.length && 's'}!`;
            const message = `We have detected ${quests.length} new tweet${
                quests.length && 's'
            } in <a href="https://www.twitter.com/${twitterAccount.metadata.username}">@${
                twitterAccount.metadata.username
            }</a>. A Twitter Quest ${quests.length && 'for each'} has been ${
                isPublished ? 'published' : 'prepared'
            } for you in <a href="${DASHBOARD_URL}/pool/${pool._id}/quests">${pool.settings.title}</a>.`;

            await MailService.send(account.email, subject, message);

            logger.info(`Created ${quests.length} Twitter Quests in ${pool.settings.title}`);
        } catch (error) {
            logger.info(error);
        }
    }
}
