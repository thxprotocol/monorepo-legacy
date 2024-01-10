import crypto from 'crypto';
import { v1 } from 'uuid';

export function uuidV1(salt?: string) {
    if (!salt) return v1();

    // Use a cryptographic hash function (SHA-256 in this example)
    const hash = crypto.createHash('sha256');

    // Update the hash with the salt
    hash.update(salt);

    // Get the hashed data in hexadecimal format
    const hashedData = hash.digest('hex');

    // Create a UUID from the first 16 bytes of the hashed data
    const uuid = `${hashedData.slice(0, 8)}-${hashedData.slice(8, 12)}-${hashedData.slice(12, 16)}-${hashedData.slice(
        16,
        20,
    )}-${hashedData.slice(20, 32)}`;

    return uuid;
}
