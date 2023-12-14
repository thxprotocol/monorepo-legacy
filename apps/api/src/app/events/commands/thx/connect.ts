import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { createSelectMenuConnectCampaign } from '@thxnetwork/api/events/components';
import { CommandInteraction, PermissionFlagsBits } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';

export const onSubcommandConnect = async (interaction: CommandInteraction) => {
    try {
        const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
        if (!isAdmin) throw new Error('Only server admins can run this command!');

        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new Error('Connect your THX Account with your Discord account first.');
        const row = await createSelectMenuConnectCampaign(account, interaction.guild);

        interaction.reply({ components: [row as any], ephemeral: true });
    } catch (error) {
        logger.error(error);
        interaction.reply({
            content: error.message,
            ephemeral: true,
        });
    }
};
export default { onSubcommandConnect };
