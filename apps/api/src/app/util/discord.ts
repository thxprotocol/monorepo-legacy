import { Client, SlashCommandBuilder } from 'discord.js';
import { REST, Routes } from 'discord.js';
import { DISCORD_CLIENT_ID, BOT_TOKEN } from '../config/secrets';
import { logger } from './logger';
import { onAutoComplete } from '../events/InteractionCreated';
import { Events } from 'discord.js';

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

export const commandRegister = async (commandList: SlashCommandBuilder[]) => {
    try {
        const commands = commandList.map((cmd) => cmd.toJSON());
        await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
        logger.info(`Successfully reloaded ${commands.length} application (/) commands.`);
    } catch (error) {
        logger.error(`Some error happened while loading application (/) commands.`);
        logger.error(error);
    }
};

export const eventRegister = (client: Client<true>, router: { [key: string]: any }) => {
    Object.keys(router).forEach((key) => {
        client.on(key, router[key]);
    });
    client.on(Events.InteractionCreate, onAutoComplete);
    client.on('error', (error) => {
        console.error('Discord.js error:', error);
    });
};

export function discordColorToHex(discordColorCode) {
    return `#${discordColorCode.toString(16).padStart(6, '0')}`;
}
