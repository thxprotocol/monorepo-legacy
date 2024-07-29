import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import store from '@thxnetwork/dashboard/store';
import { redirectSignout, redirectVerifyEmail } from '@thxnetwork/dashboard/utils/guards';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        name: 'login',
        path: '/login',
        component: () => import('../views/Login.vue'),
    },
    {
        name: 'signout',
        path: '/signout',
        beforeEnter: redirectSignout,
    },
    {
        name: 'authRedirect',
        path: '/auth/redirect',
        component: () => import('../views/AuthRedirect.vue'),
    },
    {
        name: 'verify',
        path: '/verify',
        beforeEnter: redirectVerifyEmail,
    },
    {
        name: 'invite',
        path: '/invite',
        component: () => import('../views/Invite.vue'),
        meta: { requiresAuth: true },
    },
    {
        name: 'dashboard',
        path: '/',
        component: () => import('../views/Dashboard.vue'),
        meta: { requiresAuth: true },
        children: [
            {
                name: 'home',
                path: '/',
                component: () => import('../views/dashboard/Home.vue'),
            },
            {
                name: 'campaign',
                path: '/campaign/:id',
                redirect: '/campaign/:id/analytics',
                component: () => import('../views/dashboard/Campaign.vue'),
                children: [
                    {
                        name: 'analytics',
                        path: 'analytics',
                        component: () => import('../views/dashboard/campaign/Analytics.vue'),
                    },
                    {
                        name: 'quests',
                        path: 'quests',
                        component: () => import('../views/dashboard/campaign/Quests.vue'),
                    },
                    {
                        name: 'rewards',
                        path: 'rewards',
                        component: () => import('../views/dashboard/campaign/Rewards.vue'),
                    },
                    {
                        name: 'participants',
                        path: 'participants',
                        component: () => import('../views/dashboard/campaign/Participants.vue'),
                        children: [
                            {
                                name: 'username',
                                path: ':username',
                                component: () => import('../views/dashboard/campaign/Participants.vue'),
                            },
                        ],
                    },
                    {
                        name: 'integrations',
                        path: 'integrations',
                        redirect: 'integrations/twitter',
                        component: () => import('../views/dashboard/campaign/Integrations.vue'),
                        children: [
                            {
                                name: 'IntegrationsTwitter',
                                path: 'twitter',
                                component: () => import('../views/dashboard/campaign/integrations/Twitter.vue'),
                            },
                            {
                                name: 'IntegrationsDiscord',
                                path: 'discord',
                                component: () => import('../views/dashboard/campaign/integrations/Discord.vue'),
                            },
                            {
                                name: 'IntegrationsTelegram',
                                path: 'telegram',
                                component: () => import('../views/dashboard/campaign/integrations/Telegram.vue'),
                            },
                        ],
                    },
                    {
                        name: 'Settings',
                        path: 'settings',
                        redirect: 'settings/general',
                        component: () => import('../views/dashboard/campaign/Settings.vue'),
                        children: [
                            {
                                name: 'SettingsGeneral',
                                path: 'general',
                                component: () => import('../views/dashboard/campaign/settings/General.vue'),
                            },
                            {
                                name: 'SettingsTeam',
                                path: 'team',
                                component: () => import('../views/dashboard/campaign/settings/Team.vue'),
                            },
                            {
                                name: 'SettingsWallets',
                                path: 'wallets',
                                component: () => import('../views/dashboard/campaign/settings/Wallets.vue'),
                            },
                            {
                                name: 'SettingsAppearance',
                                path: 'appearance',
                                component: () => import('../views/dashboard/campaign/settings/Appearance.vue'),
                            },
                            {
                                name: 'SettingsWidget',
                                path: 'widget',
                                component: () => import('../views/dashboard/campaign/settings/Widget.vue'),
                            },
                        ],
                    },
                ],
            },
            {
                name: 'account',
                path: '/account',
                component: () => import('../views/dashboard/Account.vue'),
            },
            {
                name: 'Developer',
                path: '/developer',
                redirect: 'developer/api',
                component: () => import('../views/dashboard/Developer.vue'),
                children: [
                    {
                        name: 'DeveloperAPI',
                        path: 'api',
                        component: () => import('../views/dashboard/developer/API.vue'),
                    },
                    {
                        name: 'DeveloperIdentities',
                        path: 'identities',
                        component: () => import('../views/dashboard/developer/Identities.vue'),
                    },
                    {
                        name: 'DeveloperEvents',
                        path: 'events',
                        component: () => import('../views/dashboard/developer/Events.vue'),
                    },
                    {
                        name: 'DeveloperWebhooks',
                        path: 'webhooks',
                        component: () => import('../views/dashboard/developer/Webhooks.vue'),
                    },
                ],
            },
            {
                name: 'Invoices',
                path: '/invoices',
                component: () => import('../views/dashboard/Invoices.vue'),
            },
            {
                name: 'preview',
                path: '/preview/:poolId',
                component: () => import('../views/dashboard/Preview.vue'),
            },
            {
                name: 'campaigns',
                path: '/campaigns',
                component: () => import('../views/dashboard/Campaigns.vue'),
            },
            {
                name: 'coins',
                path: '/coins',
                component: () => import('../views/dashboard/Coins.vue'),
            },
            {
                name: 'nft',
                path: '/nft',
                component: () => import('../views/dashboard/NFT.vue'),
            },
            {
                name: 'metadata',
                path: '/nft/:variant/:nftId',
                redirect: '/nft/:variant/:nftId/metadata',
                component: () => import('../views/dashboard/nft/NFT.vue'),
                children: [
                    {
                        path: 'metadata',
                        component: () => import('../views/dashboard/nft/Metadata.vue'),
                    },
                ],
            },
        ],
    },
];

const router = new VueRouter({
    mode: 'history',
    routes,
});

router.beforeEach((to, from, next) => {
    // This route requires auth, check if logged in
    if (to.matched.some((record) => record.meta.requiresAuth)) {
        // Not logged in, redirect to login page
        if (!store.getters['auth/isAuthenticated']) {
            next({ name: 'login', query: { redirect: to.fullPath } });
        }
        // Logged in, proceed to route
        else {
            next();
        }
    } else {
        // Route does not require auth, proceed
        next();
    }
});

export default router;
