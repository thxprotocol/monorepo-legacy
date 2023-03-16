import { Events } from 'discord.js';
import onClientReady from './ClientReady';
import onInteractionCreated from './InteractionCreated';

export default {
    [Events.ClientReady]: onClientReady,
    [Events.InteractionCreate]: onInteractionCreated,
};
