import winston from 'winston';
import { NODE_ENV } from '@thxnetwork/api/config/secrets';

const formatWinston = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: NODE_ENV === 'test' ? 'warn' : 'debug',
    format: formatWinston,
    transports: [new winston.transports.Console()],
});
