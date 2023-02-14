import cors from 'cors';
import { AUTH_URL, WALLET_URL, DASHBOARD_URL, WIDGET_URL } from '../config/secrets';

export const corsHandler = cors(async (req: any, callback: any) => {
    const origin = req.header('Origin');
    const allowedOrigins = [AUTH_URL, WALLET_URL, DASHBOARD_URL, WIDGET_URL];

    if (!origin || allowedOrigins.indexOf(origin) > -1) {
        callback(null, {
            credentials: true,
            origin: '*',
        });
    } else {
        callback(new Error('Not allowed by CORS'));
    }
});
