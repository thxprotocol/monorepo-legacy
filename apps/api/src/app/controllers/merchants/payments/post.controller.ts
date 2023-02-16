import { STRIPE_SECRET_TEST_WEBHOOK } from '@thxnetwork/api/config/secrets';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { stripe } from '@thxnetwork/api/util/stripe';
import { Request, Response } from 'express';

const controller = async (req: Request, res: Response) => {
    let event = req.body;

    if (STRIPE_SECRET_TEST_WEBHOOK) {
        const signature = req.header('stripe-signature');
        try {
            event = stripe.webhooks.constructEvent(req.rawBody, signature, STRIPE_SECRET_TEST_WEBHOOK);
        } catch (err) {
            console.log(`⚠️  Webhook signature verification failed.`, err.message);
            return res.sendStatus(400);
        }
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            console.log({ session });
            break;
        }
        case 'payment_intent.succeeded': {
            console.log(event);
            break;
        }
        case 'payment_link.created': {
            const paymentLink = event.data.object;
            const lineItems = await stripe.paymentLinks.listLineItems(paymentLink.id);
            const lineItemPrice = lineItems.data[0].price;
            const product = await stripe.products.retrieve(lineItemPrice.product as string);

            if (product.metadata.perkId) {
                await ERC721Perk.findOneAndUpdate(
                    { _id: product.metadata.perkId },
                    {
                        price: lineItemPrice.unit_amount,
                        priceCurrency: lineItemPrice.currency.toUpperCase(),
                        paymentLinkId: paymentLink.id,
                    },
                );
            }

            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

export default { controller };
