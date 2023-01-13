import mixpanel from 'mixpanel-browser';
import { MIXPANEL_TOKEN } from './secrets';
import { IAccount } from '../types/account';

const mixpanelClient = () => {
    mixpanel.init(MIXPANEL_TOKEN);
    return mixpanel;
};

export const track = {
    UserSignsIn: (account: IAccount) => {
        if (!MIXPANEL_TOKEN) return;
        const mixpanel = mixpanelClient();
        mixpanel.identify(account.sub);
        mixpanel.people.set('$name', `${account.firstName} ${account.lastName}`);
        mixpanel.people.set('$email', account.email);
        mixpanel.people.set('plan', account.plan);
        mixpanel.track('user signs in', { distinct_id: account.sub });
    },
    UserVisits: (sub: string, path: string, params: string[]) => {
        if (!MIXPANEL_TOKEN) return;
        mixpanelClient().track(`user visits ${path}`, { distinct_id: sub, params });
    },
    UserOpens: (sub: string, modal: string) => {
        if (!MIXPANEL_TOKEN) return;
        mixpanelClient().track(`user opens ${modal}`, { distinct_id: sub });
    },
    UserCreates: (sub: string, item: string) => {
        if (!MIXPANEL_TOKEN) return;
        mixpanelClient().track(`user creates ${item}`, { distinct_id: sub });
    },
};
