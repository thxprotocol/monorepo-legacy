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
        const quests = await thx.quests.list();
        const questDailyId = quests.daily[0]._id;
        const entry = await thx.quests.daily.entry.create(questDailyId);
        console.log(entry);
    } catch (error) {
        console.log(error);
    }
}
