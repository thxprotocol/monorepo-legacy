import Airtable from 'airtable';
import db from '../src/util/database';
import { Account } from '../src/models/Account';
import { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, MONGODB_URI } from '../src/util/secrets';

async function main() {
    db.connect(MONGODB_URI);
    const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
    // Only query for active accounts
    const query = Account.find({ active: true, privateKey: { $exists: false } });

    for await (const account of query) {
        const date = new Date(account.createdAt);
        try {
            await base('Pipeline: Signups').create({
                Email: account.email,
                // getMonth() starts at 0, so for a numeric display of the month we need to add 1
                Date: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
                AcceptUpdates: account.acceptUpdates,
            });
        } catch (e) {
            console.log(e);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
