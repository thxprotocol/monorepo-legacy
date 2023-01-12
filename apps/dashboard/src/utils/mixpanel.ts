import mixpanel from 'mixpanel-browser';
import { MIXPANEL_TOKEN } from './secrets';
import { IAccount } from '../types/account';

const client = () => {
    mixpanel.init(MIXPANEL_TOKEN);
    return mixpanel;
};

export const track = {
    UserSignedIn: (account: IAccount) => {
        const mixpanel = client();
        mixpanel.identify(account.sub);
        mixpanel.people.set('$name', `${account.firstName} ${account.lastName}`);
        mixpanel.people.set('$email', account.email);
        mixpanel.people.set('plan', account.plan);
        mixpanel.track('user sign in', { distinct_id: account.sub });
    },
    UserViewed: (sub: string, variant: string) => {
        client().track('user visits rewards', { distinct_id: sub, variant });
    },
    UserOpened: (sub: string, variant: string) => {
        client().track('user opens reward modal', { distinct_id: sub, variant });
    },
    UserCreated: (sub: string, variant: string) => {
        client().track('user created', { distinct_id: sub, variant });
    },
};
