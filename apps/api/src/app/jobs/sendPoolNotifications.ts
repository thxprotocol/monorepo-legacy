import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import { PoolSubscription } from '../models/PoolSubscription';
import { AssetPoolDocument } from '../models/AssetPool';
import { Widget } from '../models/Widget';

const sleepTime = 60; // seconds
const chunkSize = 600;

export async function sendPoolNotification(pool: AssetPoolDocument, reward: { title: string; amount: number }) {
    const widget = await Widget.findOne({ poolId: pool._id });
    const subs = await PoolSubscription.find({ poolId: pool._id }, { sub: 1 });

    for (let i = 0; i < subs.length; i += chunkSize) {
        const chunk = subs.slice(i, i + chunkSize);
        await sendNotification(
            pool.settings.title,
            widget.domain,
            chunk.map((x) => x._id),
            reward,
        );
        await sleep(sleepTime);
    }
}

async function sendNotification(
    poolTitle: string,
    domain: string,
    subs: string[],
    reward: { title: string; amount: number },
) {
    let html = `<p style="font-size: 18px">Hi there!👋</p>`;
    html += `You can earn ${reward.amount} points in pool ${poolTitle}(${domain}) for the new reward: 
    **${reward.title}**.`;
    html += `<hr />`;

    const promises = subs.map(async (sub) => {
        const account = await AccountProxy.getById(sub);
        if (account.email) {
            await MailService.send(account.email, `🎁 New Reward released: "${reward.title}"`, html);
        }
    });
    await Promise.all(promises);
}

async function sleep(seconds: number) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
