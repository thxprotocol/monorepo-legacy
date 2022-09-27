import { InteractionResults } from 'oidc-provider';

export {};

declare global {
    namespace Express {
        interface Request {
            origin?: string;
            auth?: any;
            interaction?: any;
        }
    }
}
