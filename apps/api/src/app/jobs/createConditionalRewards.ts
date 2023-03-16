import { AssetPool } from '../models/AssetPool';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import { subMinutes } from 'date-fns';
import PointRewardService from '../services/PointRewardService';
import { RewardConditionInteraction, RewardConditionPlatform, TPointReward } from '@thxnetwork/types/index';
import { IAccount } from '../models/Account';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';

export async function createConditionalRewards() {
    const pools = await AssetPool.find({ isTwitterSyncEnabled: true });
    const endDate = new Date();
    const startDate = subMinutes(endDate, 15);

    for (const pool of pools) {
        const { isAuthorized } = await TwitterDataProxy.getTwitter(pool.sub);
        if (!isAuthorized || !pool.settings.isTwitterSyncEnabled) continue;

        const latestTweets = await TwitterDataProxy.getLatestTweets(pool.sub, startDate, endDate);
        const { title, description, amount }: TPointReward = pool.settings.defaults.conditionalRewards;

        for (const tweet of latestTweets) {
            await PointRewardService.create(pool, {
                title,
                description,
                amount,
                platform: RewardConditionPlatform.Twitter,
                interaction: RewardConditionInteraction.TwitterLike,
                content: tweet.id,
            });
        }

        const account: IAccount = await AccountProxy.getById(pool.sub);
        if (account.email) {
            await MailService.send(
                account.email,
                `Published ${latestTweets.length} conditional rewards!`,
                `We discovered ${latestTweets.length} new tweets in your connected account and habe published conditional rewards in your widget.`,
            );
        }
    }
}
