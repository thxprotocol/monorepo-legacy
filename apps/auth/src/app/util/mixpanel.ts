import mixpanel from 'mixpanel-browser';
import { MIXPANEL_TOKEN } from '../config/secrets';

export const mixpanelClient = () => {
    mixpanel.init(MIXPANEL_TOKEN);
    return mixpanel;
};

export const track = {
    UserVisits: (distinctId: string, path: string, params: string[]) => {
        if (!MIXPANEL_TOKEN) return;
        mixpanelClient().track(`user visits ${path}`, { distinct_id: distinctId, params });
    },
    UserCreates: (distinctId: string, item: string) => {
        if (!MIXPANEL_TOKEN) return;
        mixpanelClient().track(`user creates ${item}`, { distinct_id: distinctId });
    },
};
export default { mixpanelClient, track };
