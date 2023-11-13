import { TDiscordGuild } from '../types/TDiscordGuild';
import Guild from '../models/DiscordGuild';

function connect(data: Partial<TDiscordGuild>) {
    return Guild.findOneAndUpdate(data, data, { upsert: true });
}

export default { connect };
