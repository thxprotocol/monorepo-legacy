import { Guild } from 'discord.js';
import commandRegister from '../utils/commandRegister';
import commands from '../commands';

const onGuildCreated = async (guild: Guild) => {
    await commandRegister(Object.values(commands), guild.id);
};

export default onGuildCreated;
