import db from '@thxnetwork/api/util/database';
// import main from './src/ve';
// import main from './src/sdk';
import main from './src/vethx';
// import main from './src/safe';
// import main from './src/ipfs';
// import main from './src/demo';
// import main from './src/preview';
// import main from './src/metamask';

db.connect(process.env.MONGODB_URI_PROD);

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
