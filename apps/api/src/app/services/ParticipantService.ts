import { Document } from 'mongoose';
import { DiscordReaction, Participant, TwitterUser } from '../models';
import ReCaptchaService from '@thxnetwork/api/services/ReCaptchaService';
import { AccessTokenKind } from '@thxnetwork/common/enums';
import DiscordService from './DiscordService';
import { DiscordUser } from '../models/DiscordUser';

export default class ParticipantService {
    static async decorate(
        data: Document & (TQuestEntry | TRewardPayment),
        { accounts, participants }: { accounts: TAccount[]; participants: TParticipant[] },
    ) {
        const account = accounts.find((a) => a.sub === data.sub);
        const pointBalance = participants.find((p) => account.sub === String(p.sub));
        const tokens = await Promise.all(
            account.tokens.map(async (token: TToken) => {
                if (token.kind !== 'twitter') return token;
                const user = await TwitterUser.findOne({ userId: token.userId });
                return { ...token, user };
            }),
        );

        return {
            ...data.toJSON(),
            account: { ...account, tokens },
            pointBalance: pointBalance ? pointBalance.balance : 0,
        };
    }

    static async updateRiskScore(
        account: TAccount,
        poolId: string,
        { token, recaptchaAction }: { token: string; recaptchaAction: string },
    ) {
        // Get risk score from Google
        const riskAnalysis = await ReCaptchaService.getRiskAnalysis({
            token,
            recaptchaAction,
        });

        // Update the participant's risk score
        return await Participant.findOneAndUpdate({ sub: account.sub, poolId }, { riskAnalysis }, { new: true });
    }

    static async findUser(token: TToken, { userId, guildId }: { userId: string; guildId?: string }) {
        const userModelMap = {
            [AccessTokenKind.Twitter]: () => TwitterUser.findOne({ userId }),
            [AccessTokenKind.Discord]: () => DiscordUser.findOne({ userId, guildId }),
        };

        const user = userModelMap[token.kind] && (await userModelMap[token.kind]());

        return {
            kind: token.kind,
            userId: token.userId,
            metadata: token.metadata,
            user,
        } as unknown as TToken;
    }
}
