module.exports = {
    migrationFileExtension: '.js',
    mongodb: {
        url: process.env.MONGODB_URI,
    },
    migrationsDir: 'src/migrations',
    changelogCollectionName: 'changelog',
    useFileHash: false,
};
