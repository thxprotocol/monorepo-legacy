import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { createSelectMenuQuests } from '@thxnetwork/api/events/components';
import { CommandInteraction } from 'discord.js';
import { handleError } from '../error';

export const onSubcommandComplete = async (interaction: CommandInteraction) => {
    try {
        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new Error('Please, connect your THX Account with Discord first.');

        const row = await createSelectMenuQuests(interaction);
        if (!row) {
            interaction.reply({ content: 'No quests found for this campaign.', ephemeral: true });
        } else {
            interaction.reply({ components: [row as any], ephemeral: true });
        }
    } catch (error) {
        handleError(error, interaction);
    }
};
export default { onSubcommandComplete };
