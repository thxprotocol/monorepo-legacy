import { Document } from 'mongoose';
import { TwitterUser } from '../models';

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
}
