import newrelic from 'newrelic';
import { config, status } from 'migrate-mongo';
import { connection } from 'mongoose';
import { HealthCheck } from '@godaddy/terminus';

import migrateMongoConfig from '../config/migrate-mongo';

const dbConnected = async () => {
    // https://mongoosejs.com/docs/api.html#connection_Connection-readyState
    const { readyState } = connection;
    // ERR_CONNECTING_TO_MONGO
    if (readyState === 0 || readyState === 3) {
        throw new Error('Mongoose has disconnected');
    }
    // CONNECTING_TO_MONGO
    if (readyState === 2) {
        throw new Error('Mongoose is connecting');
    }
};

const migrationsApplied = async () => {
    config.set(migrateMongoConfig);
    const pendingMigrations = (await status(connection.db as any)).filter(
        (migration) => migration.appliedAt === 'PENDING',
    );
    if (pendingMigrations.length > 0) {
        throw new Error('Not all migrations applied');
    }
};

export const healthCheck: HealthCheck = async () => {
    newrelic.getTransaction().ignore();
    return Promise.all([dbConnected(), migrationsApplied()]);
};
