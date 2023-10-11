import { subMinutes } from 'date-fns';
import { QuestVariant, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
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
    const endDate = new Date();
    const startDate = subMinutes(endDate, 15);

    for await (const pool of AssetPool.find({ 'settings.isTwitterSyncEnabled': true })) {
        const { isAuthorized } = await TwitterDataProxy.getTwitter(pool.sub);
        if (!isAuthorized) continue;

        const latestTweetsForPoolOwner = await TwitterDataProxy.getLatestTweets(pool.sub, startDate, endDate);
        if (!latestTweetsForPoolOwner.length) continue;

        const { hashtag, title, description, amount, isPublished } = pool.settings.defaults.conditionalRewards;
        const latestTweets = await Promise.all(
            latestTweetsForPoolOwner.map(async (tweet: any) => {
                const isExistingQuest = await PointReward.exists({
                    poolId: String(pool._id),
                    content: tweet.id,
                });
                return { ...tweet, isExistingQuest };
            }),
        );
        const filteredTweets = latestTweets.filter((tweet) => {
            return !tweet.isExistingQuest && hashtag && containsValue(tweet.text, hashtag);
        });
        if (!filteredTweets.length) continue;

        const account: TAccount = await AccountProxy.getById(pool.sub);
        const quests = await Promise.all(
            filteredTweets.map(async (tweet) => {
                try {
                    const contentMetadata = JSON.stringify({
                        url: `https://twitter.com/${account.twitterUsername}/status/${tweet.id}`,
                        username: account.twitterUsername,
                        text: tweet.text,
                    });
                    return await QuestService.create(QuestVariant.Twitter, pool._id, {
                        index: 0,
                        title,
                        description,
                        amount,
                        platform: RewardConditionPlatform.Twitter,
                        interaction: RewardConditionInteraction.TwitterLikeRetweet,
                        content: tweet.id,
                        contentMetadata,
                        isPublished,
                    });
                } catch (error) {
                    logger.error(error);
                }
            }),
        );
        const subject = `Published ${quests.length} quest${quests.length && 's'}!`;
        const message = `We have detected ${quests.length} new tweet${quests.length && 's'}. A Twitter Quest ${
            quests.length && 'for each'
        } has been ${isPublished ? 'published' : 'prepared'} for you.`;

        await MailService.send(account.email, subject, message);

        logger.info(`[${pool.sub}] Created ${filteredTweets.length} Twitter Quests`);
    }
}
