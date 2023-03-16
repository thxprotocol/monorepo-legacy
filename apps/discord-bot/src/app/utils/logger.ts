import winston from 'winston';

const formatWinston = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
);

export const logger = winston.createLogger({
    level: 'http',
    format: formatWinston,
    transports: [new winston.transports.Console()],
});
