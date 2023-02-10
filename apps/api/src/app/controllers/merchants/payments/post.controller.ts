import { STRIPE_SECRET_TEST_WEBHOOK } from '@thxnetwork/api/config/secrets';
import { stripe } from '@thxnetwork/api/util/stripe';
import { Request, Response } from 'express';

const controller = (req: Request, res: Response) => {
    let event = req.body;

    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (STRIPE_SECRET_TEST_WEBHOOK) {
        // Get the signature sent by Stripe
        const signature = req.header('stripe-signature');

        try {
            event = stripe.webhooks.constructEvent(event, signature, STRIPE_SECRET_TEST_WEBHOOK);
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            return res.sendStatus(400);
        }
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            const connectedAccountId = event.account;
            console.log('checkout.session.completed', session, connectedAccountId);
            //
            break;
        }
        case 'payment_intent.succeeded': {
            const paymentIntent = event.data.object;
            // Then define and call a method to handle the successful payment intent.
            // handlePaymentIntentSucceeded(paymentIntent);
            console.log('payment_intent.succeeded', paymentIntent);
            // Send email
            // Mint NFT
            break;
        }
        case 'payment_method.attached': {
            const paymentMethod = event.data.object;
            // Then define and call a method to handle the successful attachment of a PaymentMethod.
            // handlePaymentMethodAttached(paymentMethod);
            console.log('payment_method.attached', paymentMethod);
            break;
        }
        // ... handle other event types
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({ received: true });
};

export default { controller };
