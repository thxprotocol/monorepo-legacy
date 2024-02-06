// https://github.com/luke-park/SecureCompatibleEncryptionExamples/blob/master/JavaScript/SCEE-Node.js
const crypto = require('crypto');
const ALGORITHM_NAME = 'aes-128-gcm';
const ALGORITHM_NONCE_SIZE = 12;
const ALGORITHM_KEY_SIZE = 16;
const PBKDF2_NAME = 'sha256';
const PBKDF2_SALT_SIZE = 16;
const PBKDF2_ITERATIONS = 1000;

const accountVariantProviderMap = {
    1: 'google',
    2: 'twitter',
    5: 'github',
    6: 'discord',
    7: 'twitch',
};

function encrypt(plaintext, key) {
    const nonce = crypto.randomBytes(ALGORITHM_NONCE_SIZE);
    const cipher = crypto.createCipheriv(ALGORITHM_NAME, key, nonce);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return Buffer.concat([nonce, ciphertext, cipher.getAuthTag()]);
}

function encryptString(plaintext, password) {
    const salt = crypto.randomBytes(PBKDF2_SALT_SIZE);
    const key = crypto.pbkdf2Sync(
        Buffer.from(password, 'utf8'),
        salt,
        PBKDF2_ITERATIONS,
        ALGORITHM_KEY_SIZE,
        PBKDF2_NAME,
    );
    const ciphertextAndNonceAndSalt = Buffer.concat([salt, encrypt(Buffer.from(plaintext, 'utf8'), key)]);
    return ciphertextAndNonceAndSalt.toString('base64');
}

module.exports = {
    async up(db, client) {
        const tokensColl = db.collection('tokens');
        const accountsColl = db.collection('accounts');
        const accounts = await (await accountsColl.find({})).toArray();
        const operations = [];

        // Iterate over accounts
        for (const account of accounts) {
            if (!account.tokens) continue;
            // Iterate over tokens in account
            for (const token of account.tokens) {
                // See what token is used for sign in
                const accountTokenKind = accountVariantProviderMap[String(account.variant)];
                // If not used for sign in
                if (accountTokenKind) {
                    // Check if token has sufficient properties
                    // if (!token.accessToken || !token.refreshToken || !token.userId) continue;

                    // Migrate that token
                    const operation = {
                        insertOne: {
                            document: {
                                sub: String(account._id),
                                kind: token.kind,
                                accessTokenEncrypted:
                                    token.accessToken && encryptString(token.accessToken, process.env.SECURE_KEY),
                                refreshTokenEncrypted:
                                    token.refreshToken && encryptString(token.refreshToken, process.env.SECURE_KEY),
                                expiry: token.expiry,
                                userId: token.userId,
                                createdAt: new Date(),
                                updatedAt: new Date(),
                            },
                        },
                    };
                    operations.push(operation);
                }
                // Ignore all other tokens
            }
        }

        await tokensColl.bulkWrite(operations);
    },

    async down(db, client) {
        // TODO write the statements to rollback your migration (if possible)
        // Example:
        // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
    },
};
