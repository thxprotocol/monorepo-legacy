import { AssetPool } from '../models/AssetPool';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import { subMinutes } from 'date-fns';
import PointRewardService from '../services/PointRewardService';
import { RewardConditionInteraction, RewardConditionPlatform, TPointReward } from '@thxnetwork/types/index';
import { IAccount } from '../models/Account';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import { PointReward } from '../models/PointReward';

export async function createConditionalRewards() {
    const endDate = new Date();
    const startDate = subMinutes(endDate, 15);

    for await (const pool of AssetPool.find({ 'settings.isTwitterSyncEnabled': true })) {
        const { isAuthorized } = await TwitterDataProxy.getTwitter(pool.sub);
        if (!isAuthorized) continue;

        const latestTweets = await TwitterDataProxy.getLatestTweets(pool.sub, startDate, endDate);
        const { title, description, amount }: TPointReward = pool.settings.defaults.conditionalRewards;
        const rewards = [];

        for (const tweet of latestTweets) {
            const result = await PointReward.exists({ poolId: String(pool._id), content: tweet.id });
            if (result) continue;
            const reward = await PointRewardService.create(pool, {
                title,
                description,
                amount,
                platform: RewardConditionPlatform.Twitter,
                interaction: RewardConditionInteraction.TwitterLike,
                content: tweet.id,
            });
            rewards.push(reward);
        }

        const account: IAccount = await AccountProxy.getById(pool.sub);
        if (rewards.length && account.email) {
            await MailService.send(
                account.email,
                `Published ${rewards.length} conditional rewards!`,
                `We discovered ${rewards.length} new tweets in your connected account! A conditional reward for each has been added to your widget.`,
            );
        }
    }
}
