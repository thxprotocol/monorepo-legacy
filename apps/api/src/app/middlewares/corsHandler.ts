import cors from 'cors';
import { AUTH_URL, API_URL, WALLET_URL, DASHBOARD_URL, WIDGET_URL, PUBLIC_URL } from '@thxnetwork/api/config/secrets';
import ClientProxy from '@thxnetwork/api/proxies/ClientProxy';

export const corsHandler = cors(async (req: any, callback: any) => {
    const origin = req.header('Origin');
    const allowedOrigins = [
        AUTH_URL,
        API_URL,
        WALLET_URL,
        DASHBOARD_URL,
        WIDGET_URL,
        PUBLIC_URL,
        'https://app.thx.network',
        'https://dev-app.thx.network',
    ];
    const isAllowedOrigin = await ClientProxy.isAllowedOrigin(origin);

    if (isAllowedOrigin) {
        allowedOrigins.push(origin);
    }

    if (!origin || allowedOrigins.includes(origin)) {
        allowedOrigins.push(origin);
        callback(null, { credentials: true, origin: allowedOrigins });
    } else {
        callback(new Error(`${origin} is not allowed by CORS`));
    }
});
