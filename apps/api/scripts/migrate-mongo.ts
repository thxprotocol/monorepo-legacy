import program from 'commander';
import migrateMongo from 'migrate-mongo';
import migrateMongoConfig from '../src/app/config/migrate-mongo';

function printMigrated(migrated: string[] = []) {
    migrated.forEach((migratedItem) => {
        console.log(`MIGRATED UP: ${migratedItem}`);
    });
}

function handleError(err) {
    console.error(`ERROR: ${err.message}`, err.stack);
    process.exit(1);
}

migrateMongo.config.set(migrateMongoConfig);

program
    .command('up')
    .description('run all pending database migrations')
    .action(() => {
        migrateMongo.database
            .connect()
            .then(({ db, client }) => migrateMongo.up(db, client))
            .then((migrated) => {
                printMigrated(migrated);
                process.exit(0);
            })
            .catch((err) => {
                handleError(err);
                printMigrated(err.migrated);
            });
    });

program
    .command('down')
    .description('undo the last applied database migration')
    .action(() => {
        migrateMongo.database
            .connect()
            .then(({ db, client }) => migrateMongo.down(db, client))
            .then((migrated) => {
                migrated.forEach((migratedItem) => {
                    console.log(`MIGRATED DOWN: ${migratedItem}`);
                });
                process.exit(0);
            })
            .catch((err) => {
                handleError(err);
            });
    });
program.parse(process.argv);
