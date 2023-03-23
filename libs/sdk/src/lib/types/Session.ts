import { User } from 'oidc-client-ts';

type Session = Partial<{
    user: User;
    accessToken: string;
    expiry: number;
    poolId: string;
    ref: string;
}>;

export default Session;
