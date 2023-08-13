import crypto from 'crypto';

export function getSigninSecret(length: number) {
    return crypto.randomBytes(length).toString('base64');
}
