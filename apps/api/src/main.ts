import 'newrelic';
import http from 'http';
import https from 'https';
import app from './app';
import db from './app/util/database';
import { createTerminus } from '@godaddy/terminus';
import { healthCheck } from './app/util/healthcheck';
import { logger } from './app/util/logger';
import { agenda } from './app/util/agenda';
import path from 'path';
import fs from 'fs';
import { NODE_ENV } from './app/config/secrets';

let server;
if (NODE_ENV === 'development') {
    const dir = path.dirname(__dirname);
    server = https.createServer(
        {
            key: fs.readFileSync(path.resolve(dir, '../../certs/localhost.key')),
            cert: fs.readFileSync(path.resolve(dir, '../../certs/localhost.crt')),
            ca: fs.readFileSync(path.resolve(dir, '../../certs/rootCA.crt')),
        },
        app,
    );
} else {
    server = http.createServer(app);
}

const options = {
    healthChecks: {
        '/healthcheck': healthCheck,
        'verbatim': true,
    },
    onSignal: (): Promise<any> => {
        logger.info('Server shutting down gracefully');
        return Promise.all([db.disconnect(), agenda.stop()]);
    },
    logger: logger.error,
};

createTerminus(server, options);

process.on('uncaughtException', function (err: Error) {
    if (err) {
        logger.error({
            message: 'Uncaught Exception was thrown, shutting down',
            errorName: err.name,
            errorMessage: err.message,
            stack: err.stack,
        });
        process.exit(1);
    }
});

logger.info({
    message: `Server is starting on port: ${app.get('port')}, env: ${NODE_ENV}`,
    port: app.get('port'),
    env: NODE_ENV,
});

server.listen(app.get('port'));
