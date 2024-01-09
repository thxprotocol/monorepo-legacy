import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { TELEGRAM_API_HASH, TELEGRAM_API_ID, TELEGRAM_SESSION_STRING } from './app/config/secrets';
import { logger } from './app/util/logger';

const session = new StringSession(TELEGRAM_SESSION_STRING);

const client = new TelegramClient(session, TELEGRAM_API_ID, TELEGRAM_API_HASH, {
    connectionRetries: 5,
});

export default async () => {
    await client.connect(); // This assumes you have already authenticated with .start()
    logger.info('THX Bot (Telegram) ready!');
};

export { client };
