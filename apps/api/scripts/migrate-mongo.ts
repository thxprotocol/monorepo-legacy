import { migrateMongoScript } from '@thxnetwork/common/lib/migrate-mongo';
import migrateMongoConfig from '../src/app/config/migrate-mongo';

migrateMongoScript(migrateMongoConfig);
