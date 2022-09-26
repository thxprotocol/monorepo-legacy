import morgan from 'morgan';
import json from 'morgan-json';
import winston from 'winston';
import { Request } from 'express';
import { NODE_ENV, VERSION } from './secrets';

const formatWinston = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: NODE_ENV === 'test' ? 'warn' : 'http',
    format: formatWinston,
    transports: [new winston.transports.Console()],
});

const formatMorgan = json({
    'method': ':method',
    'url': ':url',
    'status': ':status',
    'ip': ':remote-addr',
    'bytes': ':res[content-length]',
    'ms': ':response-time',
    'user': ':remote-user',
    'user-agent': ':user-agent',
});

export const requestLogger = morgan(formatMorgan, {
    skip: (req: Request) => req.baseUrl && req.baseUrl.startsWith(`/${VERSION}/ping`),
    stream: { write: (message: string) => logger.http(JSON.parse(message)) },
});
