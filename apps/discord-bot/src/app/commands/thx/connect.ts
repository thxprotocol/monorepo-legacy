import GuildService from '../../services/guild.service';
import { client } from '../../../bootstrap';
import { CommandInteractionOptionResolver, PermissionFlagsBits, channelLink } from 'discord.js';
import { thxClient } from '@thxnetwork/discord/configs/oidc';

export const onSubcommandConnect = async (interaction) => {
    const options = interaction.options as CommandInteractionOptionResolver;
    const poolId = options.getString('pool_id', true);
    const channelId = options.getString('channel_id', true);

    const isAdmin = (interaction.member.permissions as any).has(PermissionFlagsBits.Administrator);
    if (!isAdmin)
        return interaction.reply({
            content: 'You much be Guild Administrator tobe able to do this',
            ephemeral: true,
        });

    const account = await thxClient.account.getByDiscordId(interaction.user.id).catch();
    if (!account)
        return interaction.reply({
            content: 'Please connect your THX Account with Discord first.',
            ephemeral: true,
        });

    const pool = await thxClient.pools.get(poolId);
    if (!pool) {
        return interaction.reply({ content: `Pool could not be found for ID ${poolId}.`, ephemeral: true });
    }
    if (pool.sub !== account._id) {
        return interaction.reply({
            content: 'This Discord account is not connected to the account of the pool owner.',
            ephemeral: true,
        });
    }

    const channel: any = await client.channels.fetch(channelId);
    if (!channel) {
        return interaction.reply({
            content: `Channel could not be found for ID ${channelId}.`,
            ephemeral: true,
        });
    }

    const guild = await GuildService.get(interaction.guildId);
    if (!guild) {
        const channel: any = client.channels.cache.get(channelId);
        channel.send(
            "Hi!:wave: I'm THX Bot, keep an eye on this channel to earn points that you can redeem for coins and NFT's:gift:",
        );
    }

    await GuildService.connect(interaction.guildId, poolId, channelId);

    interaction.reply({
        content: `Well done!🥳 You have connected "${pool.title}" with this server. I will publish announcements in [${
            channel.name
        }](${channelLink(channelId)})`,
        ephemeral: true,
    });
};
