import { TORUS_NETWORK_TYPE } from '@toruslabs/customauth';

export default interface Credential {
  clientId: string;
  clientSecret: string;
  grantType: 'client_credentials' | 'authorization_code';
  /* Optionals */
  requestUrl?: string;
  redirectUrl?: string;
  torusNetwork?: TORUS_NETWORK_TYPE;
  scopes?: string;
}
