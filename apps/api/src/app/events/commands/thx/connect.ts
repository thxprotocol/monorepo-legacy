import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { createSelectMenuConnectCampaign } from '@thxnetwork/api/events/components';
import { CommandInteraction, PermissionFlagsBits } from 'discord.js';

export const onSubcommandConnect = async (interaction: CommandInteraction) => {
    const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
    if (!isAdmin)
        return interaction.reply({
            content: 'Only server admins can run this command!',
            ephemeral: true,
        });

    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    if (!account)
        return interaction.reply({
            content: 'Connect your THX Account with your Discord account first.',
            ephemeral: true,
        });

    const row = await createSelectMenuConnectCampaign(account, interaction.guild);
    interaction.reply({ components: [row as any], ephemeral: true });
};
export default { onSubcommandConnect };
