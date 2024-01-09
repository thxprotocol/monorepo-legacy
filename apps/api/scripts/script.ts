import db from '@thxnetwork/api/util/database';

db.connect(process.env.MONGODB_URI_PROD);

async function main() {
    // Add your script here!
    // Run with `yarn run api:script`
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
