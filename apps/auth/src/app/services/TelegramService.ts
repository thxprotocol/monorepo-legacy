import { Api, TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { TELEGRAM_API_HASH, TELEGRAM_API_ID, TELEGRAM_BOT_TOKEN, TELEGRAM_SESSION_STRING } from '../config/secrets';

const session = new StringSession(TELEGRAM_SESSION_STRING);
const client = new TelegramClient(session, TELEGRAM_API_ID, TELEGRAM_API_HASH, {
    connectionRetries: 5,
});

async function getLoginURL(uid: string) {
    await client.connect();

    const result: any = await client.invoke(
        new Api.auth.ExportLoginToken({
            apiId: TELEGRAM_API_ID,
            apiHash: TELEGRAM_API_HASH,
            exceptIds: [],
        }),
    );

    console.log(result.token); // prints the result
    const url = `tg://login?token=${Buffer.from(result.token).toString('base64url')}`;
    console.log(url);
}

async function getToken(code: string) {
    // Exchange the code for an access token
    const result = await client.invoke(
        new Api.auth.AcceptLoginToken({
            token: Buffer.from(code),
        }),
    );
    console.log(result); // prints the result
}

export default { getLoginURL, getToken };
