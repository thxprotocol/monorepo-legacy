import { User } from 'oidc-client-ts';

type Session = Partial<{
  user: User;
  privateKey: string;
  accessToken: string;
}>;

export default Session;
