import { CommandInteraction, CommandInteractionOptionResolver, SlashCommandBuilder } from 'discord.js';
import { thxClient } from '../configs/oidc';

export default {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Show current user wallet infomation.')
        .addStringOption((option) =>
            option
                .setName('network')
                .setDescription('Network that your wallet rely on')
                .setRequired(true)
                .addChoices(
                    { name: 'Hardhat', value: '31337' },
                    { name: 'PolygonMumbai', value: '80001' },
                    { name: 'Polygon', value: '137' },
                ),
        ),
    executor: async (interaction: CommandInteraction) => {
        const options = interaction.options as CommandInteractionOptionResolver;
        const network = options.getString('network', true);

        const account = await thxClient.account.getByDiscordId(interaction.user.id);
        const [wallet] = await thxClient.walletManager.list(Number(network), account._id);
        const result = await thxClient.walletManager.getManagers(wallet._id);

        console.log("Lorem", result);
    },
};
