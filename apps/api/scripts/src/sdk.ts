import { THXAPIClient } from '@thxnetwork/sdk/clients/';
import { API_URL, AUTH_URL } from '@thxnetwork/api/config/secrets';

export default async function main() {
    const thx = new THXAPIClient({
        authUrl: AUTH_URL,
        apiUrl: API_URL,
        clientId: 'BitG_fGJI5k70kQgEeyID',
        clientSecret: 'pniCrGc49hb_l18_MrpahhJC8SexAV1nHE9RR9CkZA2qA_YbRmJd1hSHl5fcpJA1ngmRwuoys47JfLtYJDlSgA',
    });
    await thx.events.create({ event: 'test', identity: '4de81b20-c71d-11ee-ac82-a970a9e4ebc4' });
}
