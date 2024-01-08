import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { createSelectMenuRewards } from '@thxnetwork/api/events/components';
import { CommandInteraction } from 'discord.js';
import { handleError } from '../error';

export const onSubcommandBuy = async (interaction: CommandInteraction) => {
    try {
        const account = await AccountProxy.getByDiscordId(interaction.user.id);
        if (!account) throw new Error('Please, connect your THX Account with Discord first.');

        const row = await createSelectMenuRewards(interaction.guild);

        interaction.reply({ components: [row as any], ephemeral: true });
    } catch (error) {
        handleError(error, interaction);
    }
};
export default { onSubcommandBuy };
