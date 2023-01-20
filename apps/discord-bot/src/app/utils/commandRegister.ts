import { REST, Routes } from 'discord.js';
import { CLIENT_ID, TOKEN } from '../configs/secrets';
import { ICommand } from '../types/ICommand';

const rest = new REST({ version: '10' }).setToken(TOKEN);

const commandRegister = async (commandRouter: ICommand[], guildId?: string) => {
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    const commands = commandRouter.map((item) => item.data.toJSON());

    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    try {
        let data;
        if (guildId) {
            data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, guildId), { body: commands });
        } else {
            data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        }

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.log(`Some error happened while loading application (/) commands.`);
        console.error(error);
    }
};

export default commandRegister;
