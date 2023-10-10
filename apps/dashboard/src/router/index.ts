import store from '@thxnetwork/dashboard/store';
import {
    assertAuthorization,
    downloadScreenshot,
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
        name: 'pools',
        path: '/pools',
        component: () => import('../views/Pools.vue'),
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
                name: 'download',
                path: 'download',
                beforeEnter: downloadScreenshot,
            },
            {
                name: 'dashboard',
                path: 'dashboard',
                component: () => import('../views/pool/Analytics.vue'),
            },
            {
                name: 'participants',
                path: 'participants',
                component: () => import('../views/pool/Participants.vue'),
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
                name: 'Settings',
                path: 'settings',
                component: () => import('../views/pool/Settings.vue'),
                children: [
                    {
                        name: 'General',
                        path: 'general',
                        component: () => import('../views/pool/settings/General.vue'),
                    },
                    {
                        name: 'Discord',
                        path: 'discord',
                        component: () => import('../views/pool/settings/Discord.vue'),
                    },
                    {
                        name: 'Commerce',
                        path: 'commerce',
                        component: () => import('../views/pool/settings/Commerce.vue'),
                    },
                    {
                        name: 'Widget',
                        path: 'widget',
                        component: () => import('../views/pool/settings/Widget.vue'),
                    },
                ],
            },
            {
                name: 'Developer',
                path: 'developer',
                component: () => import('../views/pool/Developer.vue'),
                children: [
                    {
                        name: 'Webhooks',
                        path: 'webhooks',
                        component: () => import('../views/pool/developer/Webhooks.vue'),
                    },
                    {
                        name: 'API',
                        path: 'api',
                        component: () => import('../views/pool/developer/API.vue'),
                    },
                ],
            },
        ],
    },
    {
        path: '/preview/:poolId',
        component: () => import('../views/Preview.vue'),
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
