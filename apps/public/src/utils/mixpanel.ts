import mixpanel from 'mixpanel-browser';
import { API_URL, MIXPANEL_TOKEN } from '../config/secrets';

const MIXPANEL_PROXY = API_URL + '/v1/data';

export const mixpanelClient = () => {
    // console.log(MIXPANEL_TOKEN, MIXPANEL_PROXY);
    mixpanel.init(MIXPANEL_TOKEN, { api_host: MIXPANEL_PROXY });
    return mixpanel;
};

export const track = {
    UserVisits: (sub: string, path: string, params: string[]) => {
        if (!MIXPANEL_TOKEN) return;
        const mixpanel = mixpanelClient();
        mixpanel.track(`user visits ${path}`, { distinct_id: sub || mixpanel.get_distinct_id(), params });
    },
};
