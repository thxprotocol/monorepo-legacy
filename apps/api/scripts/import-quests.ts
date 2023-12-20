import { THXAPIClient } from '@thxnetwork/sdk/clients';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

async function main() {
    const thx = new THXAPIClient({
        apiUrl: 'https://localhost:3000', // Optional
        authUrl: 'https://localhost:3030', // Optional
        clientId: 'msuq4Znuv3q8hLf7ATnlP',
        clientSecret: 'YP_k8_LnPG58LHqzWGxg3EMBBGVwwJUmqsuQZdoMtEAD-85hJwRt2vxfev23T92h727bDwCqh3cIkx6meT0xxg',
    });

    // const identity = await thx.identity.create();
    // console.log('ID', identity);

    const event = '86920c71-8f23-4db1-ba88-4fbcb6376e99';
    const identity = '9c5352b4-f474-4430-8867-9ab769b3c21d';

    await thx.events.create({ event, identity });
    console.log('Event created: ', `"${event}"`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error.response.data);
        process.exit(1);
    });
