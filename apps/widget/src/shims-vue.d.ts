declare module '*.vue' {
    import type { DefineComponent } from 'vue-demi';
    import { CompatVue } from '@vue/runtime-dom';
    const Vue: CompatVue;
    export default Vue;
    export * from '@vue/runtime-dom';
    const { configureCompat } = Vue;
    // eslint-disable-next-line
    const component: DefineComponent<{}, {}, any>;
    export { configureCompat };
    export default component;
}
