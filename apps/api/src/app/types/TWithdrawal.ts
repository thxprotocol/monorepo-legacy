import { WithdrawalState, WithdrawalType } from '@thxnetwork/api/types/enums';

export type TWithdrawal = {
    id: string;
    type: WithdrawalType;
    state: WithdrawalState;
    poolId: string;
    sub: string;
    beneficiary: string; // TODO Should be deprecated after sub was added
    transactions: string[];
    amount: number;
    unlockDate: Date;
    rewardId?: string;
    withdrawalId?: number;
    tokenId?: number;
    failReason?: string;
    createdAt: Date;
    updatedAt?: Date;
};
