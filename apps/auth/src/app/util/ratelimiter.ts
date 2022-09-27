import rateLimit from 'express-rate-limit';

export const rateLimitRewardGive = rateLimit({
    windowMs: 3600 * 1000, // in seconds * 1000ms
    max: 10, // limit each IP to n requests per windowMs
});
