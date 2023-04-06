import { Invite } from 'discord.js';
import { handleError } from '../commands/error';
import { TGatewayEvent } from '@thxnetwork/discord/types/TGatewayEvent';
import { TInvite } from '@thxnetwork/discord/types/TInvite';
import GatewayEventService from '../services/gateway-event.service';
import InviteService from '../services/invite.service';

const onInviteCreated = async (invite: Invite) => {
    try {
        await InviteService.create([mapInvite(invite)]);
        console.log('INVITE CREATED!-----------------------------------------------', invite);
        await GatewayEventService.create({
            guildId: invite.guild.id,
            event: invite,
            name: 'inviteCreate',
        } as TGatewayEvent);
    } catch (error) {
        handleError(error);
    }
};

function mapInvite(invite: Invite): TInvite {
    return {
        guildId: invite.guild.id,
        code: invite.code,
        url: invite.url,
        inviterId: invite.inviter.id,
        uses: invite.uses,
    } as TInvite;
}

export default onInviteCreated;
