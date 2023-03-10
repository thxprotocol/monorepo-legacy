import { Client, GatewayIntentBits } from 'discord.js';
import { MONGODB_URI, TOKEN } from './app/configs/secrets';

import eventRouter from './app/events';
import eventRegister from './app/utils/eventRegister';
import database from './app/utils/database';
import { thxClient } from './app/configs/oidc';

export const client = new Client({ intents: [GatewayIntentBits.Guilds] });
eventRegister(client, eventRouter);

export default async () => {
    await database.connect(MONGODB_URI);
    await thxClient.init();
    client.login(TOKEN);
};
