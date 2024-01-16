import { getAbiForContractName } from '@thxnetwork/api/config/contracts';
import db from '@thxnetwork/api/util/database';

db.connect(process.env.MONGODB_URI_PROD);

async function main() {
    // const bpt = await getAbiForContractName('UnlimitedSupplyToken')
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
