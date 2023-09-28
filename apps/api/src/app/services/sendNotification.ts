import { sleep } from '@thxnetwork/api/util';
import AccountProxy from '../proxies/AccountProxy';
import MailService from './MailService';
import { Widget } from './WidgetService';
import { PoolSubscription } from '../models/PoolSubscription';
import { logger } from '../util/logger';
import {
    TDailyReward,
    TMilestoneReward,
    TPointReward,
    TReferralReward,
    TWeb3Quest,
} from '@thxnetwork/types/interfaces';
import { getById } from './PoolService';

async function sendNotification(reward: TWeb3Quest | TPointReward | TMilestoneReward | TReferralReward | TDailyReward) {
    if (!reward.isPublished) return;

    const pool = await getById(reward.poolId);
    const sleepTime = 60; // seconds
    const chunkSize = 600;

    const widget = await Widget.findOne({ poolId: pool._id });
    const subscriptions = await PoolSubscription.find({ poolId: pool._id }, { sub: 1, _id: 0 });
    const subs = subscriptions.map((x) => x.sub);

    for (let i = 0; i < subs.length; i += chunkSize) {
        const subsChunk = subs.slice(i, i + chunkSize);
        const { amount, amounts } = reward as any;

        let html = `<p style="font-size: 18px">New reward!🔔</p>`;
        html += `You can earn <strong>${amount || amounts[0]} points ✨</strong> at <a href="${widget.domain}">${
            pool.settings.title
        }</a>.`;
        html += `<hr />`;
        html += `<strong>${reward.title}</strong><br />`;
        html += `<i>${reward.description}</i>`;

        const promises = subsChunk.map(async (sub) => {
            try {
                const account = await AccountProxy.getById(sub);
                if (!account.email) return;

                await MailService.send(account.email, `🎁 New Quest: "${reward.title}"`, html);
            } catch (error) {
                logger.error(error);
            }
        });

        await Promise.all(promises);
        await sleep(sleepTime);
    }

    if (pool.settings.discordWebhookUrl) {
        const widget = await Widget.findOne({ poolId: pool._id });

        await axios.post(pool.settings.discordWebhookUrl, {
            content: '@here ' + pool.settings.defaults.discordMessage,
            embeds: [
                {
                    title: `${reward.title}`,
                    description: reward.description,
                    url: widget.domain,
                },
            ],
        });
    }
}
