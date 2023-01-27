import mixpanel from 'mixpanel-browser';
import { API_URL, MIXPANEL_TOKEN } from './secrets';
import { IAccount } from '../types/account';

const MIXPANEL_PROXY = API_URL + '/v1/data';

export const mixpanelClient = () => {
    mixpanel.init(MIXPANEL_TOKEN, { api_host: MIXPANEL_PROXY });
    return mixpanel;
};

function identify(account: IAccount) {
    if (!MIXPANEL_TOKEN) return;
    mixpanelClient();
    mixpanel.identify(account.sub);
    mixpanel.people.set('$name', `${account.firstName} ${account.lastName}`);
    mixpanel.people.set('$email', account.email);
    mixpanel.people.set('plan', account.plan);
    mixpanel.people.set('address', account.address || '');
}

const trackers: { [event: string]: (param1?: any, param2?: any, param3?: any) => void } = {
    UserIdentify: (account: IAccount) => {
        identify(account);
    },
    UserSignsIn: (account: IAccount) => {
        identify(account);
        mixpanel.track('user signs in', { distinct_id: account.sub });
    },
    UserVisits: (sub: string, path: string, params: string[]) => {
        mixpanelClient().track(`user visits ${path}`, { distinct_id: sub, params });
    },
    UserOpens: (sub: string, modal: string) => {
        mixpanelClient().track(`user opens ${modal}`, { distinct_id: sub });
    },
    UserCreates: (sub: string, item: string) => {
        mixpanelClient().track(`user creates ${item}`, { distinct_id: sub });
    },
};

export const track = (event: string, params: any[]) => {
    if (!MIXPANEL_TOKEN) return;
    trackers[event](...params);
};

export default { mixpanelClient, track };
