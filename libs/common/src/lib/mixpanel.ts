import mixpanel from 'mixpanel-browser';

let accessToken = '',
    proxyUrl = '';

interface TMixpanelIdentity {
    firstName: string;
    lastName: string;
    sub: string;
    plan: number;
    email?: string;
    address?: string;
}

function identify(account: TMixpanelIdentity) {
    if (!accessToken || !proxyUrl) return;

    mixpanel.identify(account.sub);
    mixpanel.people.set('$name', `${account.firstName || ''} ${account.lastName || ''}`);
    mixpanel.people.set('$email', account.email);
    mixpanel.people.set('plan', account.plan);
    mixpanel.people.set('address', account.address || '');
}

const trackers: { [event: string]: (param1?: any, param2?: any, param3?: any) => void } = {
    UserIdentify: (account) => {
        identify(account);
    },
    UserSignsIn: (account) => {
        identify(account);
        mixpanel.track('user signs in', { distinct_id: account.sub });
    },
    UserVisits: (sub: string, route: string, props: { [key: string]: any }) => {
        mixpanel.track('user visits', { distinct_id: sub, route, ...props });
    },
    UserOpens: (sub: string, id: string, props: { [key: string]: any }) => {
        mixpanel.track('user opens', { distinct_id: sub, id, ...props });
    },
    UserCreates: (sub: string, item: string, props: { [key: string]: any }) => {
        mixpanel.track(`user creates ${item}`, { distinct_id: sub, ...props });
    },
};

export const init = (mixpanelToken: string, proxyBaseUrl: string) => {
    if (!mixpanelToken) return console.error('Missing mixpanel token');
    if (!proxyBaseUrl) return console.error('Missing proxy url');

    accessToken = mixpanelToken;
    proxyUrl = proxyBaseUrl ? `${proxyBaseUrl}/v1/data` : '';

    mixpanel.init(mixpanelToken, { api_host: proxyUrl });
};

export const client = () => mixpanel;
export const track = (event: string, params: any[]) => {
    trackers[event](...params);
};

export default { init, client, track };
