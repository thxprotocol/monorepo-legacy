import crypto from 'crypto';

export function createRandomToken() {
    const buf = crypto.randomBytes(16);
    return buf.toString('hex');
}
