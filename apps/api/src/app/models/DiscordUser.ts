import mongoose from 'mongoose';

export type DiscordUserDocument = mongoose.Document & TDiscordUser;

export const DiscordUser = mongoose.model<DiscordUserDocument>(
    'DiscordUser',
    new mongoose.Schema(
        {
            userId: String,
            guildId: String,
            profileImgUrl: String,
            username: String,
            publicMetrics: {
                joinedAt: Date,
                messageCount: Number,
                reactionCount: Number,
            },
        },
        { timestamps: true },
    ),
    'discorduser',
);
