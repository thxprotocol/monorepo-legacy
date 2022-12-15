import { User } from 'oidc-client-ts';

type Session = Partial<{
    user: User;
    accessToken: string;
    poolId: string;
    ref: string;
}>;

export default Session;
