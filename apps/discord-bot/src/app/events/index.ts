import { Events } from 'discord.js';

import onClientReady from './ClientReady';

export default {
    [Events.ClientReady]: onClientReady,
};
