import { subMinutes } from 'date-fns';
import { QuestVariant, RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/enums';
import { TAccount } from '@thxnetwork/types/interfaces';
import { AssetPool } from '../models/AssetPool';
import { PointReward } from '../models/PointReward';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import QuestService from '../services/QuestService';

export async function createTwitterQuests() {
    const endDate = new Date();
    const startDate = subMinutes(endDate, 15);
    console.log('Job started');

    for await (const pool of AssetPool.find({ 'settings.isTwitterSyncEnabled': true })) {
        const { isAuthorized } = await TwitterDataProxy.getTwitter(pool.sub);
        console.log(isAuthorized);
        if (!isAuthorized) continue;

        const latestTweetsForPoolOwner = await TwitterDataProxy.getLatestTweets(pool.sub, startDate, endDate);
        console.log(latestTweetsForPoolOwner);
        if (!latestTweetsForPoolOwner.length) continue;

        const { hashtag, title, description, amount, isPublished } = pool.settings.defaults.conditionalRewards;
        const latestTweets = await Promise.all(
            latestTweetsForPoolOwner.map(async (tweet: any) => {
                const isExistingReward = await PointReward.exists({
                    poolId: String(pool._id),
                    content: tweet.id,
                });
                return { isExistingReward, tweet };
            }),
        );
        const filteredTweets = latestTweets.filter(({ isExistingReward, tweet }) => {
            console.log(isExistingReward, hashtag, tweet.text, containsValue(tweet.text, hashtag));
            return !isExistingReward && hashtag && containsValue(tweet.text, hashtag);
        });

        console.log(filteredTweets);
        if (!filteredTweets.length) continue;

        const quests = await Promise.all(
            filteredTweets.map(async (tweet) => {
                const contentMetadata = await getContentMetadata(filteredTweets[0]);
                console.log({ contentMetadata });
                // TODO Could also create Like quest and flatten the array
                return await QuestService.create(QuestVariant.Social, pool._id, {
                    index: 0,
                    title,
                    description,
                    amount,
                    platform: RewardConditionPlatform.Twitter,
                    interaction: RewardConditionInteraction.TwitterRetweet,
                    content: tweet.id,
                    contentMetadata,
                    isPublished,
                });
            }),
        );
        console.log(quests);

        const account: TAccount = await AccountProxy.getById(pool.sub);
        if (account.email) {
            await MailService.send(
                account.email,
                `Published ${quests.length} quest${quests.length && 's'}!`,
                `We discovered ${quests.length} new tweet${
                    quests.length && 's'
                } in your connected Twitter account! A conditional reward ${
                    quests.length && 'for each'
                } has been published for your widget.`,
            );
        }
    }
}

function containsValue(text: string, hashtag: string) {
    return text.toLowerCase().includes('#' + hashtag.toLowerCase());
}

async function getContentMetadata(tweet: { id: string; text: string; includes: any }) {
    const username = tweet.includes.users[0].username;
    return JSON.stringify({
        url: `https://twitter.com/${username}/status/${tweet.id}`,
        username,
        text: tweet.text,
    });
}
