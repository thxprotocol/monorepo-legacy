import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueMeta from 'vue-meta';
import { ValidationObserver, ValidationProvider, extend, localize } from 'vee-validate';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';
import * as rules from 'vee-validate/dist/rules';
import * as en from 'vee-validate/dist/locale/en.json';
import VueLazyload from 'vue-lazyload';
import './main.scss';
import { CMS_URL } from './config/secrets';

// Install VeeValidate rules and localization
Object.keys(rules).forEach((rule) => {
    extend(rule, (rules as any)[rule]);
});

localize('en', en);

// Install VeeValidate components globally
Vue.component('ValidationObserver', ValidationObserver);
Vue.component('ValidationProvider', ValidationProvider);

axios.defaults.baseURL = CMS_URL;
axios.defaults.withCredentials = true;

Vue.config.productionTip = false;

Vue.use(VueLazyload);
Vue.use(VueMeta);
Vue.use(BootstrapVue);

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount('#app');
