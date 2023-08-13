import crypto from 'crypto';

export function getsigningSecret(length: number) {
    return crypto.randomBytes(length).toString('base64');
}
