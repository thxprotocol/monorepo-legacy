import { Request, Response } from 'express';
import { stripe } from '@thxnetwork/api/util/stripe';
import { logger } from '@thxnetwork/api/util/logger';
import PerkPaymentService from '@thxnetwork/api/services/PerkPaymentService';
import { STRIPE_SECRET_WEBHOOK } from '@thxnetwork/api/config/secrets';

const controller = async (req: Request, res: Response) => {
    let event = req.body;

    if (STRIPE_SECRET_WEBHOOK) {
        const signature = req.header('stripe-signature');
        try {
            event = stripe.webhooks.constructEvent(req.rawBody, signature, STRIPE_SECRET_WEBHOOK);
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            return res.sendStatus(400);
        }
    }

    switch (event.type) {
        // TODO implement for showing token early during iDeal flow
        // case 'payment_intent.requires_action': {
        //     break;
        // }
        case 'payment_intent.succeeded': {
            await PerkPaymentService.onPaymentIntentSucceeded(event);
            break;
        }
        default:
            logger.info({ message: `Unhandled event type ${event.type}` });
    }

    res.json({ received: true });
};

export default { controller };
