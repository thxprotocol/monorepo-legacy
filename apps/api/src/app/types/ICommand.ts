import { RepliableInteraction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export type ICommand = {
    data: SlashCommandBuilder[];
    executor: (interaction: RepliableInteraction) => void;
};
