import { NODE_ENV } from '../config/secrets';

export function getBasePath() {
    return NODE_ENV !== 'production' ? './apps/api/src/app' : '/usr/src/app/src/app';
}
