import { Events } from 'discord.js';
import onClientReady from './ClientReady';
import onInteractionCreated from './InteractionCreated';
import onGuildMemberAdd from './GuildMemberAdd';
import onGuildCreate from './GuildCreate';
import onGuildDelete from './GuildDelete';

export default {
    [Events.ClientReady]: onClientReady,
    [Events.InteractionCreate]: onInteractionCreated,
    [Events.GuildMemberAdd]: onGuildMemberAdd,
    [Events.GuildCreate]: onGuildCreate,
    [Events.GuildDelete]: onGuildDelete,
};
