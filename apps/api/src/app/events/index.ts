import { Events } from 'discord.js';
import onClientReady from './ClientReady';
import onInteractionCreated from './InteractionCreated';
import onMessageReactionAdd from './MessageReactionAdd';
import onMessageCreate from './MessageCreate';
import onGuildCreate from './GuildCreate';
import onGuildDelete from './GuildDelete';

export default {
    [Events.ClientReady]: onClientReady,
    [Events.GuildCreate]: onGuildCreate,
    [Events.GuildDelete]: onGuildDelete,
    [Events.InteractionCreate]: onInteractionCreated,
    [Events.MessageReactionAdd]: onMessageReactionAdd,
    [Events.MessageCreate]: onMessageCreate,
};
