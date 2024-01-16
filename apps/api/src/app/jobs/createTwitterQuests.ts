import { subMinutes } from 'date-fns';
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

function containsValue(text: string, hashtag: string) {
    return text.toLowerCase().includes('#' + hashtag.toLowerCase());
}

export async function createTwitterQuests() {
    for await (const pool of AssetPool.find({ 'settings.isTwitterSyncEnabled': true })) {
        const endDate = new Date();
        const startDate = subMinutes(endDate, 60);
        try {
            const { isAuthorized } = await TwitterDataProxy.getTwitter(pool.sub);
            if (!isAuthorized) {
                logger.error(`Started autoquest but ${pool.sub} has no Twitter access.`);
                continue;
            }

            const latestTweetsForPoolOwner = await TwitterDataProxy.getLatestTweets(pool.sub, startDate, endDate);
            if (!latestTweetsForPoolOwner.length) continue;

            const { hashtag, title, description, amount, locks, isPublished } =
                pool.settings.defaults.conditionalRewards;
            const latestTweets = await Promise.all(
                latestTweetsForPoolOwner.map(async (tweet: any) => {
                    const isExistingQuest = await PointReward.exists({
                        poolId: String(pool._id),
                        content: tweet.id,
                    });
                    return { ...tweet, isExistingQuest };
                }),
            );
            logger.info(`Found ${latestTweets.length} posts for ${pool.sub} in campaign ${pool._id}`);

            const filteredTweets = latestTweets.filter((tweet) => {
                return !tweet.isExistingQuest && hashtag && containsValue(tweet.text, hashtag);
            });
            if (!filteredTweets.length) {
                logger.info(`Found no new autoquests for ${pool.sub} in campaign ${pool._id}`);
                continue;
            }

            const account: TAccount = await AccountProxy.getById(pool.sub);
            const twitterAccount = account.connectedAccounts.find((token) => token.kind === AccessTokenKind.Twitter);
            if (!twitterAccount) {
                logger.error(`Could not find Twitter accounts for ${pool.sub} in campaign ${pool._id}`);
                continue;
            }

            const quests = await Promise.all(
                filteredTweets.map(async (tweet) => {
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
            console.log({ quests });
            const subject = `Published ${quests.length} quest${quests.length && 's'}!`;
            const message = `We have detected ${quests.length} new tweet${quests.length && 's'}. A Twitter Quest ${
                quests.length && 'for each'
            } has been ${isPublished ? 'published' : 'prepared'} for you.`;

            await MailService.send(account.email, subject, message);

            logger.info(`Created ${filteredTweets.length} Twitter Quests in campaign ${pool._id}`);
        } catch (error) {
            logger.info(error);
        }
    }
}
