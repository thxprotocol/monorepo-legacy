import store from '@thxnetwork/dashboard/store';
import {
    assertAuthorization,
    redirectAccount,
    redirectCollaborationRequest,
    redirectPoolTransfer,
    redirectSignin,
    redirectSigninSilent,
    redirectSignout,
    redirectSignup,
    redirectVerifyEmail,
} from '@thxnetwork/dashboard/utils/guards';
import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { track } from '../../../../libs/common/src/lib/mixpanel';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        name: 'home',
        path: '/',
        component: () => import('../views/Home.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'pool',
        path: '/pool/:id',
        redirect: '/pool/:id/dashboard',
        component: () => import('../views/Pool.vue'),
        beforeEnter: assertAuthorization,
        children: [
            {
                name: 'dashboard',
                path: 'dashboard',
                component: () => import('../views/pool/Analytics.vue'),
            },
            {
                name: 'quests',
                path: 'quests',
                component: () => import('../views/pool/Quests.vue'),
            },
            {
                name: 'rewards',
                path: 'rewards',
                component: () => import('../views/pool/Rewards.vue'),
            },
            {
                name: 'participants',
                path: 'participants',
                component: () => import('../views/pool/Participants.vue'),
                children: [
                    {
                        name: 'username',
                        path: ':username',
                        component: () => import('../views/pool/Participants.vue'),
                    },
                ],
            },
            {
                name: 'integrations',
                path: 'integrations',
                redirect: 'integrations/twitter',
                component: () => import('../views/pool/Integrations.vue'),
                children: [
                    {
                        name: 'IntegrationsTwitter',
                        path: 'twitter',
                        component: () => import('../views/pool/integrations/Twitter.vue'),
                    },
                    {
                        name: 'IntegrationsDiscord',
                        path: 'discord',
                        component: () => import('../views/pool/integrations/Discord.vue'),
                    },
                    {
                        name: 'IntegrationsGalachain',
                        path: 'galachain',
                        component: () => import('../views/pool/integrations/Galachain.vue'),
                    },
                    {
                        name: 'IntegrationsTelegram',
                        path: 'telegram',
                        component: () => import('../views/pool/integrations/Telegram.vue'),
                    },
                ],
            },
            {
                name: 'Developer',
                path: 'developer',
                redirect: 'developer/general',
                component: () => import('../views/pool/Developer.vue'),
                children: [
                    {
                        name: 'DeveloperGeneral',
                        path: 'general',
                        component: () => import('../views/pool/developer/General.vue'),
                    },
                    {
                        name: 'DeveloperIdentities',
                        path: 'identities',
                        component: () => import('../views/pool/developer/Identities.vue'),
                    },
                    {
                        name: 'DeveloperWebhooks',
                        path: 'webhooks',
                        component: () => import('../views/pool/developer/Webhooks.vue'),
                    },
                    {
                        name: 'DeveloperAPI',
                        path: 'api',
                        component: () => import('../views/pool/developer/API.vue'),
                    },
                    {
                        name: 'DeveloperEvents',
                        path: 'events',
                        component: () => import('../views/pool/developer/Events.vue'),
                    },
                ],
            },
            {
                name: 'Settings',
                path: 'settings',
                redirect: 'settings/general',
                component: () => import('../views/pool/Settings.vue'),
                children: [
                    {
                        name: 'SettingsGeneral',
                        path: 'general',
                        component: () => import('../views/pool/settings/General.vue'),
                    },
                    {
                        name: 'SettingsTeam',
                        path: 'team',
                        component: () => import('../views/pool/settings/Team.vue'),
                    },
                    {
                        name: 'SettingsAppearance',
                        path: 'appearance',
                        component: () => import('../views/pool/settings/Appearance.vue'),
                    },
                    {
                        name: 'SettingsWidget',
                        path: 'widget',
                        component: () => import('../views/pool/settings/Widget.vue'),
                    },
                    {
                        name: 'SettingsInvoices',
                        path: 'invoices',
                        component: () => import('../views/pool/settings/Invoices.vue'),
                    },
                ],
            },
        ],
    },
    {
        name: 'preview',
        path: '/preview/:poolId',
        component: () => import('../views/Preview.vue'),
    },
    {
        name: 'campaigns',
        path: '/campaigns',
        component: () => import('../views/Campaigns.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'coins',
        path: '/coins',
        component: () => import('../views/Coins.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'nft',
        path: '/nft',
        component: () => import('../views/NFT.vue'),
        beforeEnter: assertAuthorization,
    },
    {
        name: 'metadata',
        path: '/nft/:variant/:nftId',
        redirect: '/nft/:variant/:nftId/metadata',
        component: () => import('../views/nft/NFT.vue'),
        beforeEnter: assertAuthorization,
        children: [
            {
                path: 'metadata',
                component: () => import('../views/nft/Metadata.vue'),
            },
        ],
    },
    {
        name: 'sign in redirect',
        path: '/signin-oidc',
        component: () => import('../views/SigninRedirect.vue'),
    },
    {
        name: 'verify email',
        path: '/verify_email',
        beforeEnter: redirectVerifyEmail,
    },
    {
        name: 'collaboration request',
        path: '/collaborator',
        beforeEnter: redirectCollaborationRequest,
    },
    {
        name: 'pool transfer',
        path: '/pools/:poolId/transfer/:token',
        beforeEnter: redirectPoolTransfer,
    },
    {
        name: 'account',
        path: '/account',
        beforeEnter: redirectAccount,
    },
    {
        name: 'sign up',
        path: '/signup',
        beforeEnter: redirectSignup,
    },

    {
        name: 'sign out',
        path: '/signout',
        beforeEnter: redirectSignout,
    },
    {
        name: 'sign in',
        path: '/signin',
        beforeEnter: redirectSignin,
    },
    {
        path: '/silent-renew',
        beforeEnter: redirectSigninSilent,
    },
];

const router = new VueRouter({
    mode: 'history',
    scrollBehavior: function (to) {
        if (to.hash) {
            return { selector: to.hash };
        } else {
            return { x: 0, y: 0 };
        }
    },
    routes,
});

router.beforeEach(async (to, from, next) => {
    try {
        const user = await store.dispatch('account/getUser');
        if (user && to.name) track('UserVisits', [user.sub, to.name, to.params as unknown as string[]]);
        return next();
    } catch (err) {
        console.error(err);
    }
});

export default router;
