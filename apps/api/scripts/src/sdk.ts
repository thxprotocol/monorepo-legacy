import { THXIdentityClient } from '@thxnetwork/sdk/clients/';
import { API_URL, AUTH_URL } from '@thxnetwork/api/config/secrets';

export default async function main() {
    const thx = new THXIdentityClient({
        authUrl: AUTH_URL,
        apiUrl: API_URL,
        identityCode: '2696b790-ef39-11ee-87ea-6bb7a1e089a0',
        clientId: 'YWkb_YikIVekMGEN8oyUS',
        clientSecret: 'a9WisgaR9hKLN_A48tGSROkD38Za-S5BNeAmQ5MzWxbkrbK61MJ8o1YVxTddGgle4szGutqXU8A0hfo8n5O0hQ',
    });
    try {
        await thx.request.authenticate();
        console.log('getuser', thx.request.getUser());
    } catch (error) {
        console.log(error);
    }
}
