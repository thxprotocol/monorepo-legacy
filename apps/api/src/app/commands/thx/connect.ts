import AccountProxy from '@thxnetwork/api/proxies/AccountProxy';
import PoolService from '@thxnetwork/api/services/PoolService';
import {
    CommandInteraction,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from 'discord.js';

export const onSubcommandConnect = async (interaction: CommandInteraction) => {
    const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
    if (!isAdmin)
        return interaction.reply({
            content: 'Only admin roles can run this command.',
            ephemeral: true,
        });

    const account = await AccountProxy.getByDiscordId(interaction.user.id);
    if (!account)
        return interaction.reply({
            content: 'Connect your THX Account with Discord.',
            ephemeral: true,
        });

    const pools = await PoolService.getAllBySub(account._id);
    const select = new StringSelectMenuBuilder();
    select.setCustomId('thx.campaign.connect').setPlaceholder('Connect a campaign');

    for (const index in pools) {
        const pool = pools[index];
        const embed = new EmbedBuilder();
        const { title, description } = pool.settings;

        const options = new StringSelectMenuOptionBuilder().setLabel(String(title)).setValue(String(pool._id));

        embed.setTitle(title);

        if (description) {
            embed.setDescription(description);
            options.setDescription(description);
        }

        select.addOptions(options);
    }

    const row = new ActionRowBuilder().addComponents(select);
    interaction.reply({ components: [row as any], ephemeral: true });
};
export default { onSubcommandConnect };
