import { STRIPE_SECRET_WEBHOOK } from '@thxnetwork/api/config/secrets';
import { ERC721 } from '@thxnetwork/api/models/ERC721';
import { ERC721Metadata } from '@thxnetwork/api/models/ERC721Metadata';
import { ERC721Perk } from '@thxnetwork/api/models/ERC721Perk';
import { Wallet } from '@thxnetwork/api/models/Wallet';
import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import ERC721Service from '@thxnetwork/api/services/ERC721Service';
import PoolService from '@thxnetwork/api/services/PoolService';
import { account } from '@thxnetwork/api/util/jest/constants';
import { stripe } from '@thxnetwork/api/util/stripe';
import { Request, Response } from 'express';

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
        case 'checkout.session.completed': {
            const session = event.data.object;
            console.log({ session });
            break;
        }
        case 'payment_intent.succeeded': {
            const { perk_id, sub } = event.data.object.metadata;

            if (sub && perk_id) {
                const account = await AccountProxy.getById(sub);
                const perk = await ERC721Perk.findById(perk_id);
                const erc721 = await ERC721.findById(perk.erc721Id);
                const metadata = await ERC721Metadata.findById(perk.erc721metadataId);
                const pool = await PoolService.getById(perk.poolId);
                const address = await account.getAddress(pool.chainId);

                await ERC721Service.mint(pool, erc721, metadata, sub, address);
            }
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
