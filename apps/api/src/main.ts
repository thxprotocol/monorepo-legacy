import 'newrelic';
import http from 'http';
import https from 'https';
import httpProxy from 'http-proxy';
import app from './app';
import discordBot from './discord';
import db from './app/util/database';
import { createTerminus } from '@godaddy/terminus';
import { healthCheck } from './app/util/healthcheck';
import { logger } from './app/util/logger';
import { agenda } from './app/util/agenda';
import fs from 'fs';
import { LOCAL_CERT, LOCAL_CERT_KEY, NODE_ENV } from './app/config/secrets';
import path from 'path';

let server: http.Server;
if (LOCAL_CERT && LOCAL_CERT_KEY) {
    const ssl = {
        key: fs.readFileSync(path.resolve(path.dirname(__dirname), LOCAL_CERT_KEY)),
        cert: fs.readFileSync(path.resolve(path.dirname(__dirname), LOCAL_CERT)),
    };

    server = https.createServer(ssl, app);
    httpProxy
        .createServer({
            target: {
                host: 'localhost',
                port: 8545,
            },
            ssl,
        })
        .listen(8547);
} else {
    server = http.createServer(app);
}

const options = {
    healthChecks: {
        '/healthcheck': healthCheck,
        'verbatim': true,
    },
    onSignal: () => {
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

discordBot();
