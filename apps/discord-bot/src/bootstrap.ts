import { Client, GatewayIntentBits } from 'discord.js';
import { TOKEN } from './app/configs/secrets';

import eventRouter from './app/events';
import eventRegister from './app/utils/eventRegister';

export default () => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    eventRegister(client, eventRouter);

    client.login(TOKEN);
};
