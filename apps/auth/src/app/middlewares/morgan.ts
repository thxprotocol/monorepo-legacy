import morgan from 'morgan';
import { logger } from '../util/logger';
import { NODE_ENV } from '../config/secrets';

const stream = {
    write: (message) => logger.http(message),
};

const skip = () => {
    return ['development', 'test'].includes(NODE_ENV || 'development');
};

export default morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
    { stream, skip },
);
