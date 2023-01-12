import mixpanel from 'mixpanel-browser';
import { MIXPANEL_TOKEN } from './secrets';
import { IAccount } from '../types/account';

const client = () => {
    mixpanel.init(MIXPANEL_TOKEN);
    return mixpanel;
};

export const track = {
    UserSignsIn: (account: IAccount) => {
        const mixpanel = client();
        mixpanel.identify(account.sub);
        mixpanel.people.set('$name', `${account.firstName} ${account.lastName}`);
        mixpanel.people.set('$email', account.email);
        mixpanel.people.set('plan', account.plan);
        mixpanel.track('user signs in', { distinct_id: account.sub });
    },
    UserVisits: (sub: string, path: string, query: string[]) => {
        client().track(`user visits ${path}`, { distinct_id: sub, query });
    },
    UserOpens: (sub: string, modal: string) => {
        client().track(`user opens ${modal}`, { distinct_id: sub });
    },
    UserCreates: (sub: string, item: string) => {
        client().track(`user creates ${item}`, { distinct_id: sub });
    },
};
