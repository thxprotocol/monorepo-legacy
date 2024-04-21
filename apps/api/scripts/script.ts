import db from '@thxnetwork/api/util/database';
import main from './src/veLiquidity';
// import main from './src/veTransfer';
// import main from './src/veRewards';
// import main from './src/time';
// import main from './src/galachain';
// import main from './src/sdk';
// import main from './src/vethx';
// import main from './src/safe';
// import main from './src/ipfs';
// import main from './src/invoices';
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
