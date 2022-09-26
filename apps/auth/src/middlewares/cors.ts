import cors from 'cors';
import { Client } from '../models/Client';
import { AUTH_URL, WALLET_URL, DASHBOARD_URL, WIDGETS_URL } from '../util/secrets';

export const corsHandler = cors(async (req: any, callback: any) => {
    const origin = req.header('Origin');
    const allowedOrigins = [AUTH_URL, WALLET_URL, DASHBOARD_URL, WIDGETS_URL, 'http://localhost:8080'];
    const clients = await Client.find({});

    for (const client of clients) {
        for (const uri of client.payload.request_uris) {
            if (!allowedOrigins.includes(uri)) {
                allowedOrigins.push(uri);
            }
        }
    }

    if (!origin || allowedOrigins.indexOf(origin) > -1) {
        callback(null, {
            credentials: true,
            origin: '*',
        });
    } else {
        callback(new Error('Not allowed by CORS'));
    }
});
