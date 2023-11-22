import { AssetPoolDocument } from '../models/AssetPool';
import { PoolSubscription } from '../models/PoolSubscription';
import { logger } from '../util/logger';
import { sleep } from '../util';
import { TNotification } from '@thxnetwork/common/lib/types';
import { Notification } from '@thxnetwork/api/models/Notification';
import AccountProxy from '../proxies/AccountProxy';
import MailService from './MailService';

const MAIL_CHUNK_SIZE = 600;

async function send(
    pool: AssetPoolDocument,
    { subjectId, subject, message, link }: Partial<TNotification> & { link?: { src: string; text: string } },
) {
    const poolSubs = await PoolSubscription.find({ poolId: pool._id });
    const subs = poolSubs.map((x) => x.sub);
    const accounts = (await AccountProxy.getMany(subs)).filter((a) => a.email);

    // Create chunks for bulk email sending to avoid hitting rate limits
    for (let i = 0; i < subs.length; i += MAIL_CHUNK_SIZE) {
        const chunk = subs.slice(i, i + MAIL_CHUNK_SIZE);
        await Promise.all(
            chunk.map(async (sub) => {
                try {
                    // Make sure to not sent duplicate notifications
                    // for the same subjectId
                    const isNotifiedAlready = await Notification.exists({ sub, subjectId });
                    if (isNotifiedAlready) return;

                    const account = accounts.find((a) => a.sub === sub);
                    await MailService.send(account.email, subject, message, link);

                    await Notification.create({ sub, poolId: pool._id, subjectId, subject, message });
                } catch (error) {
                    logger.error(error);
                }
            }),
        );

        // Sleep 60 seconds before sending the next chunk
        await sleep(60);
    }
}

export default { send };
