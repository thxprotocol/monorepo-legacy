import path from 'path';
import { MONGODB_URI } from '@thxnetwork/api/config/secrets';

export default {
    migrationFileExtension: '.js',
    mongodb: {
        url: MONGODB_URI,
    },
    migrationsDir: path.join(path.resolve(__dirname), 'app/migrations'),
    changelogCollectionName: 'changelog',
    useFileHash: false,
    moduleSystem: 'commonjs',
};
