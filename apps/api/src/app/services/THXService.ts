import axios from 'axios';
import AccountProxy from '../proxies/AccountProxy';
import { WEBHOOK_REFERRAL, WEBHOOK_MILESTONE } from '@thxnetwork/api/config/secrets';
import { AssetPoolDocument } from '../models/AssetPool';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import { logger } from '@thxnetwork/api/util/logger';

export async function runReferralRewardWebhook(pool: AssetPoolDocument, metadata?: object) {
    if (!WEBHOOK_REFERRAL) return;
    try {
        const account = await AccountProxy.getById(pool.sub);
        console.log({ account });
        if (!account || !account.referralCode) return;

        await axios.post(WEBHOOK_REFERRAL, { code: account.referralCode, metadata });
    } catch (error) {
        logger.error(error);
    }
}

export async function runMilestoneRewardWebhook(pool: AssetPoolDocument) {
    if (!WEBHOOK_MILESTONE) return;
    try {
        const wallet = await Wallet.findOne({ chainId: pool.chainId, sub: pool.sub });
        if (!wallet) return;

        await axios.post(WEBHOOK_MILESTONE, { address: wallet.address });
    } catch (error) {
        logger.error(error);
    }
}
