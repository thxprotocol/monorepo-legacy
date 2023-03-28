import AccountProxy from '../proxies/AccountProxy';
import MailService from '../services/MailService';
import { PoolSubscription } from '../models/PoolSubscription';
import { TBaseReward } from '@thxnetwork/types/interfaces';

const sleepTime = 60; // seconds
const chunkSize = 600;

export async function sendPoolNotification(poolId: string, reward: TBaseReward) {
    const subs = await PoolSubscription.find({ poolId }, { sub: 1 });

    for (let i = 0; i < subs.length; i += chunkSize) {
        const chunk = subs.slice(i, i + chunkSize);
        await sendNotification(
            chunk.map((x) => x._id),
            reward.title,
        );
        await sleep(sleepTime);
    }
}

async function sendNotification(subs: string[], rewardTitle: string) {
    let html = `<p style="font-size: 18px">Hi there!👋</p>`;
    html += `<p>Th new reward <strong>${rewardTitle}</strong> has been released!".</p>`;
    html += `<hr />`;

    const promises = subs.map(async (sub) => {
        const account = await AccountProxy.getById(sub);
        if (account.email) {
            await MailService.send(account.email, `🎁 New Reward released: "${rewardTitle}"`, html);
        }
    });
    await Promise.all(promises);
}

async function sleep(seconds: number) {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
