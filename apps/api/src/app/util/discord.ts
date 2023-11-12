import { Client } from 'discord.js';
import { REST, Routes } from 'discord.js';
import { DISCORD_CLIENT_ID, BOT_TOKEN } from '../config/secrets';
import { ICommand } from '../types/ICommand';
import { logger } from './logger';

const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

export const commandRegister = async (commandRouter: ICommand[], guildId?: string) => {
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    const commands = commandRouter.map((item) => item.data.toJSON());

    try {
        let data;
        if (guildId) {
            data = await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId), { body: commands });
            logger.info(`Successfully reloaded ${data.length} application (/) commands for guild: ${guildId}.`);
        } else {
            data = await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
            logger.info(`Successfully reloaded ${data.length} application (/) commands.`);
        }
    } catch (error) {
        logger.error(`Some error happened while loading application (/) commands.`);
        logger.error(error);
    }
};

export const eventRegister = (client: Client<true>, router: { [key: string]: any }) => {
    Object.keys(router).forEach((key) => {
        client.on(key, router[key]);
    });
};
