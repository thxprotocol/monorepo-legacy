import MixpanelBrowser, { Mixpanel } from 'mixpanel-browser';

export const mix = MixpanelBrowser.init(process.env['MIXPANEL_TOKEN'] || '') as unknown as Mixpanel;

export const mixpanel = {
    UserSignin: (profile: { sub: string; email?: string }) => {
        mix.identify(profile.sub);
        mix.people.set('email', profile.email);
        mix.track('user sign in', { distinct_id: profile.sub });
    },
    UserCreatedCoin: (profile: { sub: string; email?: string }) => {
        mix.track('user created coin', { distinct_id: profile.sub });
    },
    UserCreatedNFT: (profile: { sub: string; email?: string }) => {
        mix.track('user created nft', { distinct_id: profile.sub });
    },
    UserCreatedPool: (profile: { sub: string; email?: string }) => {
        mix.track('user created pool', { distinct_id: profile.sub });
    },
};
