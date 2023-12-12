import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import { createSelectMenuQuests } from '@thxnetwork/api/events/components';
import { CommandInteraction } from 'discord.js';

export const onSubcommandComplete = async (interaction: CommandInteraction) => {
    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    console.log(account);
    console.log(interaction);
    if (!account)
        return interaction.reply({
            content: 'Please, connect your THX Account with Discord first.',
            ephemeral: true,
        });

    const row = await createSelectMenuQuests(account, interaction.guild);
    interaction.reply({ components: [row as any], ephemeral: true });
};
export default { onSubcommandComplete };
