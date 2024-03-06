import { AccessTokenKind, QuestVariant, QuestSocialRequirement, OAuthRequiredScopes } from '@thxnetwork/common/enums';
import { Pool, QuestSocial } from '@thxnetwork/api/models';
import { logger } from '../util/logger';
import { DASHBOARD_URL } from '../config/secrets';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import QuestService from '../services/QuestService';

export async function createTwitterQuests() {
    for await (const pool of Pool.find({ 'settings.isTwitterSyncEnabled': true })) {
        try {
            const { hashtag, title, description, amount, locks, isPublished } =
                pool.settings.defaults.conditionalRewards;

            const account = await AccountProxy.findById(pool.sub);
            if (!account) {
                logger.error(`Account not found for ${pool.sub}.`);
                continue;
            }

            const token = await AccountProxy.getToken(
                account,
                AccessTokenKind.Twitter,
                OAuthRequiredScopes.TwitterAutoQuest,
            );
            if (!token) {
                logger.error(`Could not find Twitter accounts for ${pool.sub} in ${pool.settings.title}`);
                continue;
            }

            const tweets = await TwitterDataProxy.searchTweets(account, `#${hashtag}`);
            if (!tweets || !tweets.length) continue;
            logger.info(`Found tweets matching the hashtag in the last 7 days!`);
            logger.info(JSON.stringify(tweets));

            const promises = tweets.map(async (tweet: any) => {
                const isExistingQuest = !!(await QuestSocial.exists({
                    poolId: String(pool._id),
                    content: tweet.id,
                }));
                return { ...tweet, isExistingQuest };
            });
            const recentTweets = await Promise.all(promises);
            logger.info(`Found ${recentTweets.length} posts for ${pool.sub} in ${pool.settings.title}`);

            const newTweets = recentTweets.filter(
                (tweet) => !tweet.isExistingQuest && tweet.text.includes(`#${hashtag}`),
            );
            if (!newTweets.length) {
                logger.info(`Found no new autoquests for ${pool.sub} in ${pool.settings.title}`);
                continue;
            }
            logger.info(`Found ${newTweets.length} new autoquest for ${pool.sub} in ${pool.settings.title}`);

            const quests = await Promise.all(
                newTweets.map(async (tweet) => {
                    try {
                        const contentMetadata = JSON.stringify({
                            url: `https://twitter.com/${token.metadata.username}/status/${tweet.id}`,
                            username: token.metadata.username,
                            text: tweet.text,
                            minFollowersCount: 0,
                        });
                        return await QuestService.create(QuestVariant.Twitter, pool._id, {
                            index: 0,
                            title,
                            description,
                            amount,
                            locks,
                            kind: AccessTokenKind.Twitter,
                            interaction: QuestSocialRequirement.TwitterLikeRetweet,
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
            } in <a href="https://www.twitter.com/${token.metadata.username}">@${
                token.metadata.username
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
