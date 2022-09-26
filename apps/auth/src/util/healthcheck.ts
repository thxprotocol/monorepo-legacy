import newrelic from 'newrelic';
import { HealthCheck } from '@godaddy/terminus';
import { config, status } from 'migrate-mongo';
import { connection } from 'mongoose';

import migrateMongoConfig from '../migrate-mongo-config';

const dbConnected: HealthCheck = async () => {
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
    // CONNECTED_TO_MONGO
    return;
};

const migrationsApplied: HealthCheck = async () => {
    config.set(migrateMongoConfig);

    const pendingMigrations = (await status(connection.db)).filter((migration) => migration.appliedAt === 'PENDING');
    if (pendingMigrations.length > 0) {
        throw new Error('Not all migrations applied');
    }

    return;
};

export const healthCheck: HealthCheck = () => {
    newrelic.getTransaction().ignore();
    return Promise.all([dbConnected, migrationsApplied]);
};
