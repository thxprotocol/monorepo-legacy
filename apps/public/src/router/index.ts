import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { track } from '../utils/mixpanel';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'Home',
        component: () => import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        path: '/pricing',
        name: 'Pricing',
        component: () => import(/* webpackChunkName: "pricing" */ '../views/Pricing.vue'),
    },
    {
        path: '/campaigns',
        name: 'Campaigns',
        component: () => import(/* webpackChunkName: "campaigns" */ '../views/Campaigns.vue'),
    },
    {
        path: '/use-cases',
        name: 'Use Cases',
        component: () => import(/* webpackChunkName: "usecases" */ '../views/UseCases.vue'),
    },
    {
        path: '/events/play-in-business',
        name: 'Play in Business',
        component: () => import(/* webpackChunkName: "events-playinbusiness" */ '../views/events/PlayInBusiness.vue'),
    },
    {
        path: '/use-cases/:title',
        name: 'Use Case Detail',
        component: () => import(/* webpackChunkName: "usecases-usecase-detail" */ '../views/UseCaseDetail.vue'),
    },
    {
        path: '/solutions',
        name: 'Solutions',
        component: () => import(/* webpackChunkName: "integrations" */ '../views/Solutions.vue'),
    },
    {
        path: '/contact',
        name: 'Contact',
        component: () => import(/* webpackChunkName: "contact" */ '../views/Contact.vue'),
    },
    {
        path: '/signup',
        component: () => import(/* webpackChunkName: "signup" */ '../views/Signup.vue'),
    },
    {
        path: '/token',
        name: 'Token',
        component: () => import(/* webpackChunkName: "token" */ '../views/Token.vue'),
    },
    {
        path: '/demo',
        name: 'Demo',
        component: () => import(/* webpackChunkName: "demo" */ '../views/Demo.vue'),
    },
];

const router = new VueRouter({
    mode: 'history',
    base: '/',
    routes,
    scrollBehavior() {
        return { x: 0, y: 0 };
    },
});

router.beforeEach(async (to, from, next) => {
    try {
        if (to.name) track.UserVisits('', to.name, to.params as unknown as string[]);
        return next();
    } catch (err) {
        console.error(err);
    }
});

export default router;
