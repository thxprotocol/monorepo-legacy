import { TIdentity } from './Identity';

export type TEvent = {
    _id: string;
    identity: TIdentity;
    identityId: string;
    poolId: string;
    name: string;
    createdAt: Date;
};
