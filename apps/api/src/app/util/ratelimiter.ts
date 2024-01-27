import rateLimit from 'express-rate-limit';
import { NODE_ENV } from '../config/secrets';

const limitInSeconds = (seconds: number) => rateLimit(NODE_ENV !== 'test' && { windowMs: seconds * 1000, max: 1 });

export { limitInSeconds };
