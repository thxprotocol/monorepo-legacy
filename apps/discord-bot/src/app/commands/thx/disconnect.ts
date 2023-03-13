import GuildService from '../../services/guild.service';
import { client } from '../../../bootstrap';
import { PermissionFlagsBits } from 'discord.js';

export async function onSubcommandDisconnect(interaction) {
    const guild = await GuildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
    if (!isAdmin)
        return interaction.reply({
            content: 'You much be Guild Administrator tobe able to do this',
            ephemeral: true,
        });

    const channel: any = await client.channels.fetch(guild.channelId);
    channel.send('Bye!:wave: I hope you enjoy your rewards:pray:');

    return await GuildService.disconnect(guild.id);
}
