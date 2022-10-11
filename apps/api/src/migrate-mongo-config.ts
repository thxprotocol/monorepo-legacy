import dotenv from 'dotenv';

dotenv.config();

export default {
    migrationFileExtension: '.js',
    mongodb: {
        url: process.env.MONGODB_URI,
    },
    migrationsDir: 'src/migrations',
    changelogCollectionName: 'changelog',
    useFileHash: false,
};
