import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { BootstrapVue, ModalPlugin, ToastPlugin, VBTooltip } from 'bootstrap-vue';
import './main.scss';
import VueClipboard from 'vue-clipboard2';
import { fromWei } from 'web3-utils';

// Set Axios default config
axios.defaults.withCredentials = true;
axios.defaults.baseURL = process.env.VUE_APP_API_ROOT + '/v1';

// Add a request interceptor
axios.interceptors.request.use(async (config: AxiosRequestConfig) => {
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
            await store.dispatch('account/signinRedirect');
        }
        throw error;
    },
);

// Set Vue default config and attach plugins
Vue.config.productionTip = false;

// Sets a container to fix issues related to bootstrap modals
VueClipboard.config.autoSetContainer = true;

Vue.use(BootstrapVue);
Vue.use(ModalPlugin);
Vue.use(ToastPlugin);
Vue.use(VueClipboard);

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

Vue.directive('b-tooltip', VBTooltip);

// Set custom filters
Vue.filter('fromWei', (value: string) => {
    if (!value) return '';
    value = value.toString();
    return fromWei(value);
});

// Set custom filters
Vue.filter('fromBigNumber', (hex: string) => {
    return fromWei(hex);
});

Vue.filter('abbrNumber', (num: number) => {
    if (String(num).length < 4) {
        return num;
    } else if (String(num).length < 7) {
        return Math.floor(num / 1000) + 'K';
    } else if (String(num).length < 10) {
        return Math.floor(num / 1000000) + 'M';
    } else {
        return Math.floor(num / 1000000000) + 'B';
    }
});

new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
