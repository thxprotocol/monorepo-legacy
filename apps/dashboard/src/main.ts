import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios, { InternalAxiosRequestConfig } from 'axios';
import './main.scss';
import VueClipboard from 'vue-clipboard2';
import * as rules from 'vee-validate/dist/rules';
import * as en from 'vee-validate/dist/locale/en.json';
import BaseFormGroup from '@thxnetwork/dashboard/components/form-group/BaseFormGroup.vue';
import { ValidationObserver, ValidationProvider, extend, localize } from 'vee-validate';
import { NODE_ENV, API_URL, AUTH_URL, BASE_URL, MIXPANEL_TOKEN } from '@thxnetwork/dashboard/config/secrets';
import { Sentry } from '@thxnetwork/common/sentry';
import { BootstrapVue, TooltipPlugin, ModalPlugin, ToastPlugin, VBTogglePlugin } from 'bootstrap-vue';
import VueMeta from 'vue-meta';
import Mixpanel from '@thxnetwork/common/mixpanel';

if (NODE_ENV === 'production') {
    Sentry.init(Vue, router, [BASE_URL, API_URL, AUTH_URL]);
}

Mixpanel.init(MIXPANEL_TOKEN, API_URL);

// Install VeeValidate rules and localization
Object.keys(rules).forEach((rule) => {
    extend(rule, rules[rule]);
});

localize('en', en);

// Install VeeValidate components globally
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

// Register custom components globally
Vue.component('BaseFormGroup', BaseFormGroup);

// Set Axios default config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = `${process.env.VUE_APP_API_ROOT}/v1`;
axios.defaults.maxRedirects = 0;

// Add a request interceptor
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { session } = store.state.auth;
    const isExpired = session?.expires_at ? new Date(session.expires_at * 1000) < new Date() : false;
    if (session && !isExpired) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

// Set Vue default config and attach plugins
Vue.config.productionTip = false;

Vue.config.errorHandler = (error: Error, vm: Vue) => {
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
