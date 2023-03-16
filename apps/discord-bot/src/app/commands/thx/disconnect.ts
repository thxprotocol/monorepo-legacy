import GuildService from '../../services/guild.service';
import { CommandInteraction, PermissionFlagsBits } from 'discord.js';

export const onSubcommandDisconnect = async (interaction: CommandInteraction) => {
    const guild = await GuildService.get(interaction.guildId);
    if (!guild) return interaction.reply({ content: `Server connection not found.`, ephemeral: true });

    const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
    if (!isAdmin) return interaction.reply({ content: 'You are not a server admin.', ephemeral: true });

    await GuildService.disconnect(guild.id);

    interaction.reply({ content: 'Bye!:wave: I hope you enjoyed your time with us:pray:', ephemeral: true });
};
