import { stripe } from '@thxnetwork/api/util/stripe';
import { Request, Response } from 'express';

const validation = [];

const controller = async (req: Request, res: Response) => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'T-shirt',
                    },
                    unit_amount: 2000,
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'http://localhost:4242/success',
        cancel_url: 'http://localhost:4242/cancel',
    });

    res.json(session);
};

export default { validation, controller };
