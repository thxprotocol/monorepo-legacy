import db from '../src/app/util/database';
import { MONGODB_URI } from '../src/app/config/secrets';

db.connect(MONGODB_URI);

async function main() {
    const startTime = Date.now();
    // Add prerelease jobs here
    // ...

    const endTime = Date.now();
    console.log(`🔔 Duration: ${Math.floor((endTime - startTime) / 1000)} seconds`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
