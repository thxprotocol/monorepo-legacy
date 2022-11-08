declare module '*.vue' {
    import type { DefineComponent } from 'vue-demi';

    // eslint-disable-next-line
    const component: DefineComponent<{}, {}, any>;
    export default component;
}

declare module 'vue-qr';
declare module 'promise-poller';
declare module '@thxnetwork/dashboard';
