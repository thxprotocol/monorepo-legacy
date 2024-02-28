import { migrateMongoScript } from '@thxnetwork/common/migrate-mongo';
import migrateMongoConfig from '../src/app/config/migrate-mongo';

migrateMongoScript(migrateMongoConfig);
