import Mixpanel from 'mixpanel';
import { MIXPANEL_TOKEN } from '../config/secrets';

// create an instance of the mixpanel client
export const mixpanel = Mixpanel.init(MIXPANEL_TOKEN, {
    host: 'api-eu.mixpanel.com',
});
