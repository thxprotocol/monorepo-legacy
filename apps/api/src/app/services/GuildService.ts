import { TGuild } from '../types/TGuild';
import Guild from '../models/Guild';

function connect(data: Partial<TGuild>) {
    return Guild.findOneAndUpdate(data, data, { upsert: true });
}

export default { connect };
