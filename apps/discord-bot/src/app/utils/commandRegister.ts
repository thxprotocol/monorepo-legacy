import { REST, Routes } from 'discord.js';
import { DISCORD_CLIENT_ID, TOKEN } from '../configs/secrets';
import { ICommand } from '../types/ICommand';

const rest = new REST({ version: '10' }).setToken(TOKEN);

const commandRegister = async (commandRouter: ICommand[], guildId?: string) => {
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    const commands = commandRouter.map((item) => item.data.toJSON());

    try {
        let data;
        if (guildId) {
            data = await rest.put(Routes.applicationGuildCommands(DISCORD_CLIENT_ID, guildId), { body: commands });
            console.log(`Successfully reloaded ${data.length} application (/) commands for guild: ${guildId}.`);
        } else {
            data = await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: commands });
            console.log(`Successfully reloaded ${data.length} application (/) commands.`);
        }
    } catch (error) {
        console.log(`Some error happened while loading application (/) commands.`);
        console.error(error);
    }
};

export default commandRegister;
