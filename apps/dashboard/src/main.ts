import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BootstrapVue, TooltipPlugin, ModalPlugin, ToastPlugin, VBTogglePlugin } from 'bootstrap-vue';
import './main.scss';
import VueClipboard from 'vue-clipboard2';
import * as rules from 'vee-validate/dist/rules';
import * as en from 'vee-validate/dist/locale/en.json';
import { ValidationObserver, ValidationProvider, extend, localize } from 'vee-validate';
import { NODE_ENV, API_URL, AUTH_URL, BASE_URL, MIXPANEL_TOKEN } from '@thxnetwork/dashboard/utils/secrets';
import Mixpanel from '@thxnetwork/mixpanel';
import VueMeta from 'vue-meta';
import { Sentry } from '@thxnetwork/common';

if (NODE_ENV === 'production') {
    Sentry.init(Vue, router, [BASE_URL, API_URL, AUTH_URL]);
}

Mixpanel.init(MIXPANEL_TOKEN, API_URL);

// Install VeeValidate rules and localization
Object.keys(rules).forEach((rule) => {
    extend(rule, (rules as any)[rule]);
});

localize('en', en);

// Install VeeValidate components globally
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

// Set Axios default config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${process.env.VUE_APP_API_ROOT}/v1`;
axios.defaults.maxRedirects = 0;

// Add a request interceptor
axios.interceptors.request.use((config: AxiosRequestConfig) => {
    const user = store.getters['account/user'];
    if (user && !user.expired) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${user.access_token}`;
    }
    return config;
});

// Add a response interceptor
axios.interceptors.response.use(
    (res: AxiosResponse) => res,
    async (error: AxiosError) => {
        if (error.response?.status === 401) {
            const user = await store.dispatch('account/getUser');
            if (user) {
                // Token expired or invalid, signout id_token_hint
                await store.dispatch('account/signoutRedirect');
            } else {
                // id_token_hint not available, force signout and request signin
                await store.dispatch('account/signout');
                await store.dispatch('account/signinRedirect');
            }
        }
        throw error;
    },
);

// Set Vue default config and attach plugins
Vue.config.productionTip = false;

Vue.config.errorHandler = (error: Error, vm: Vue) => {
    console.error(error);
    vm.$bvToast.toast(error.message, {
        variant: 'danger',
        title: 'Error',
        noFade: true,
        noAutoHide: true,
        appendToast: true,
        solid: true,
    });
};

// Sets a container to fix issues related to bootstrap modals
VueClipboard.config.autoSetContainer = true;

Vue.use(BootstrapVue);
Vue.use(ModalPlugin);
Vue.use(ToastPlugin);
Vue.use(VueClipboard);
Vue.use(TooltipPlugin);
Vue.use(VBTogglePlugin);
Vue.use(VueMeta);

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
