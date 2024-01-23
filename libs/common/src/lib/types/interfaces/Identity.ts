import { TAccount } from './Account';

export type TIdentity = {
    _id: string;
    poolId: string;
    uuid: string;
    sub: string;
    createdAt: Date;
    account?: TAccount;
};
