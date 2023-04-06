import { Events } from 'discord.js';
import onClientReady from './ClientReady';
import onInteractionCreated from './InteractionCreated';
import onInviteCreated from './InviteCreated';
import onInviteDeleted from './InviteDeleted';
import onGuildMemberAdd from './GuildMemberAdd';
import onGuildDelete from './GuildDelete';

export default {
    [Events.ClientReady]: onClientReady,
    [Events.InteractionCreate]: onInteractionCreated,
    [Events.InviteCreate]: onInviteCreated,
    [Events.InviteDelete]: onInviteDeleted,
    [Events.GuildMemberAdd]: onGuildMemberAdd,
    [Events.GuildDelete]: onGuildDelete,
};
