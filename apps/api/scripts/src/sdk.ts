import { THXIdentityClient } from '@thxnetwork/sdk/clients/';
import { API_URL, AUTH_URL } from '@thxnetwork/api/config/secrets';

export default async function main() {
    const thx = new THXIdentityClient({
        authUrl: AUTH_URL,
        apiUrl: API_URL,
        clientId: 'YWkb_YikIVekMGEN8oyUS',
        clientSecret: 'a9WisgaR9hKLN_A48tGSROkD38Za-S5BNeAmQ5MzWxbkrbK61MJ8o1YVxTddGgle4szGutqXU8A0hfo8n5O0hQ',
    });

    thx.setIdentity('2696b790-ef39-11ee-87ea-6bb7a1e089a0');
    // thx.setIdentity('33c85260-0727-11ef-a86f-09b80652466f');

    try {
        const data = await thx.request.get('/v1/participants');
        console.log({ data });
        const quests = await thx.request.get('/v1/quests');
        console.log({ quests });
        const rewards = await thx.request.get('/v1/rewards');
        console.log({ rewards });
    } catch (error) {
        console.log(error);
    }
}
