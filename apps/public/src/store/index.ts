import Vue from 'vue';
import Vuex from 'vuex';
import MetricStore from './modules/metrics';

Vue.use(Vuex);

const modules = {
    metrics: MetricStore,
};

export default new Vuex.Store({
    state: {},
    mutations: {},
    actions: {},
    modules,
});
