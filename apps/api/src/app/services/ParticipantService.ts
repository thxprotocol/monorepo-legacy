import { Document } from 'mongoose';
import { Participant, TwitterUser } from '../models';
import ReCaptchaService from '@thxnetwork/api/services/ReCaptchaService';

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
}
