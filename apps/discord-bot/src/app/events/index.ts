import { Events } from 'discord.js';

import onClientReady from './ClientReady';
import onGuildCreated from './GuildCreated';
import onInteractionCreated from './InteractionCreated';

export default {
    [Events.ClientReady]: onClientReady,
    [Events.GuildCreate]: onGuildCreated,
    [Events.InteractionCreate]: onInteractionCreated,
};
