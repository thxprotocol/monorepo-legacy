import { Client, GatewayIntentBits } from 'discord.js';
import { MONGODB_URI, BOT_TOKEN } from './app/config/secrets';
import eventRouter from './app/events';
import eventRegister from './app/utils/eventRegister';
import database from './app/utils/database';
import { thxOIDCClient } from './app/config/oidc';

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });

eventRegister(client, eventRouter);

export default async () => {
    await database.connect(MONGODB_URI);
    await thxOIDCClient.signin();

    client.login(BOT_TOKEN);
};
