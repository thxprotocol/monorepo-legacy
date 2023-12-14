import { Client, GatewayIntentBits, Partials, PermissionFlagsBits } from 'discord.js';
import { BOT_TOKEN } from '@thxnetwork/api/config/secrets';
import { eventRegister } from '@thxnetwork/api/util/discord';
import eventRouter from '@thxnetwork/api/events';

export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

export default async () => {
    eventRegister(client, eventRouter);
    client.login(BOT_TOKEN);
};

export { PermissionFlagsBits };
