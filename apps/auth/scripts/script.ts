import db from '@thxnetwork/auth/util/database';

db.connect(process.env.MONGODB_URI_PROD);

async function main() {
    //
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
