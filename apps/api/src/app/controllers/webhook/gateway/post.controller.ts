import { Request, Response } from 'express';
import { body } from 'express-validator';
import { WEBHOOK_SIGNING_SECRET } from '@thxnetwork/api/config/secrets';
import { Wallet } from '@thxnetwork/api/models';
import VoteEscrowService from '@thxnetwork/api/services/VoteEscrowService';
import crypto from 'crypto';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { logger } from '@thxnetwork/api/util/logger';
import BalancerService from '@thxnetwork/api/services/BalancerService';
import { formatUnits } from 'ethers/lib/utils';

const validation = [body('payload').isString(), body('signature').isString()];

// Helper method to verify payload signature
function constructEvent(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const calculatedSignature = hmac.digest('base64');
    if (signature !== calculatedSignature) throw new Error('Failed signature verification');
    return JSON.parse(payload);
}

const controller = async (req: Request, res: Response) => {
    let result = false;
    try {
        // Verifies and parses the payload using the WEBHOOK_SIGNING_SECRET which you can get in Developer -> Webhooks
        const event = constructEvent(req.body.payload, req.body.signature, WEBHOOK_SIGNING_SECRET);

        switch (event.type) {
            case 'quest_entry.create': {
                const { identities, metadata } = event;
                if (!identities.length) throw new Error('No identities found in the event');

                const account = await AccountProxy.getByIdentity(identities[0]);
                if (!account) throw new Error('No account found for the identity');

                const wallets = await Wallet.find({
                    sub: account.sub,
                    chainId: { $exists: true },
                    address: { $exists: true },
                });
                if (!wallets.length) throw new Error('No wallets found for the account');

                // Get largest lock and validate with provided metadata
                const promises = wallets.map(async (wallet) => await VoteEscrowService.list(wallet));
                const locks = await Promise.all(promises);
                const [largestLock] = locks.sort((a, b) => b.amount - a.amount);
                const lockAmount = formatUnits(largestLock.amount, 18);
                const bptPrice = BalancerService.pricing['20USDC-80THX'];
                const largestAmountInUSD = Number(lockAmount) * bptPrice;

                result = largestAmountInUSD >= Number(metadata);

                break;
            }
            default: {
                console.log('Unhandled event type ' + event.type);
            }
        }

        return res.json({ result });
    } catch (error) {
        logger.error(error.message);
        return res.status(400).send('Webhook Error: ' + error.message);
    }
};

export default { validation, controller };
