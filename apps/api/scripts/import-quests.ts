import { THXAPIClient } from '@thxnetwork/sdk/clients';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

async function main() {
    const thx = new THXAPIClient({
        url: 'https://localhost:3000', // Optional
        issuer: 'https://localhost:3030', // Optional
        clientId: 'chyBeltL7rmOeTwVu-YiM',
        clientSecret: 'q4ilZuGA4VPtrGhXug3i5taXrvDtidrzyv-gJN3yVo8T2stL6RwYQjqRoK-iUiAGGvhbG_F3TEFFuD_56Q065Q',
    });

    const id = await thx.identity.create();
    console.log(id);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
