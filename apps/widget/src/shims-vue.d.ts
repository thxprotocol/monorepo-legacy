declare module '*.vue' {
    import type { DefineComponent } from 'vue-demi';
    // eslint-disable-next-line
    const component: DefineComponent<{}, {}, any>;
    export default component;
}
