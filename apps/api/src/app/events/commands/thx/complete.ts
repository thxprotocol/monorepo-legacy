import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { createSelectMenuQuests } from '@thxnetwork/api/events/components';
import { CommandInteraction } from 'discord.js';
import { logger } from '@thxnetwork/api/util/logger';

export const onSubcommandComplete = async (interaction: CommandInteraction) => {
    try {
        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new Error('Please, connect your THX Account with Discord first.');

        const row = await createSelectMenuQuests(account, interaction.guild);

        interaction.reply({ components: [row as any], ephemeral: true });
    } catch (error) {
        logger.error(error);
        interaction.reply({
            content: error.message,
            ephemeral: true,
        });
    }
};
export default { onSubcommandComplete };
