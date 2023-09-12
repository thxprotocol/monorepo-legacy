import { CollaboratorInviteState } from '../enums';

export type TCollaborator = {
    state: CollaboratorInviteState;
    email: string;
    uuid: string;
    sub: string;
    poolId: string;
};
