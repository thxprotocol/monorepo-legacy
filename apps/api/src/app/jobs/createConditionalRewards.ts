import { AssetPool, AssetPoolDocument } from '../models/AssetPool';
import TwitterDataProxy from '../proxies/TwitterDataProxy';
import { subMinutes } from 'date-fns';
import PointRewardService from '../services/PointRewardService';
import { RewardConditionInteraction, RewardConditionPlatform } from '@thxnetwork/types/index';
import { IAccount } from '../models/Account';
import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';

export async function createConditionalRewards() {
    const pools = await AssetPool.find({ isTwitterSyncEnabled: true });
    if (!pools.length) {
        return;
    }
    const endDate = new Date();
    const startDate = subMinutes(endDate, 15);

    let currentAccount: IAccount;

    for (let i = 0; i < pools.length; i++) {
        const pool = pools[i];
        if (!pool.defaultTwitterConditionalRewardSettings) {
            continue;
        }
        const defaultSettings: { title: string; description: string; amount: string } = JSON.parse(
            pool.defaultTwitterConditionalRewardSettings,
        );
        const sub = pool.sub;
        const { isAuthorized } = await TwitterDataProxy.getTwitter(sub);
        if (!isAuthorized) {
            continue;
        }
        const latestTweets = await TwitterDataProxy.getLatestTweets(sub, startDate, endDate);

        for (let j = 0; j < latestTweets.length; j++) {
            const tweet = latestTweets[j];
            await PointRewardService.create(pools[i] as AssetPoolDocument, {
                title: defaultSettings.title,
                description: defaultSettings.description,
                amount: defaultSettings.amount,
                platform: RewardConditionPlatform.Twitter,
                interaction: RewardConditionInteraction.TwitterLike,
                content: tweet.id,
            });
            if (!currentAccount || currentAccount.sub != pool.sub) {
                currentAccount = await AccountProxy.getById(pool.sub);
            }
            if (!currentAccount.email) {
                continue;
            }
            await MailService.send(
                currentAccount.email,
                `New Tweet added to the widget for the pool: ${pool.address}`,
                `The tweet "${tweet.text}" has been added to the widget`,
            );
        }
    }
}
