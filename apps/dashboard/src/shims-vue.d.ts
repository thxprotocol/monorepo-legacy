import Vue from 'vue';
import { Route, Router } from 'vue-router';
import { Store } from 'vuex';

declare module 'vue/types/vue' {
    interface Vue {
        $route: Route;
        $router: Router;
        $store: Store;
    }
}

declare module '*.vue' {
    export default Vue;
}

declare module 'vue-qr';
declare module 'promise-poller';
declare module 'file-saver';
declare module 'jspdf';
declare module 'xml2js';
declare module 'qrcode-svg';
declare module 'papaparse';
