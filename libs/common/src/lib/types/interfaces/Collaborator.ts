import { CollaboratorInviteState } from '../enums';
import { TAccount } from './Account';

export type TCollaborator = {
    account: TAccount;
    state: CollaboratorInviteState;
    email: string;
    uuid: string;
    sub: string;
    poolId: string;
    updatedAt: Date;
};
