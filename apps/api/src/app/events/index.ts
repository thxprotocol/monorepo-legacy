import { Events } from 'discord.js';
import onClientReady from './ClientReady';
import onInteractionCreated from './InteractionCreated';
import onMessageReactionAdd from './MessageReactionAdd';
import onMessageCreate from './MessageCreate';

export default {
    [Events.ClientReady]: onClientReady,
    [Events.InteractionCreate]: onInteractionCreated,
    [Events.MessageReactionAdd]: onMessageReactionAdd,
    [Events.MessageCreate]: onMessageCreate,
};
