import Vue, { VNode } from 'vue';
// vuex.d.ts
import { Store } from 'vuex';

declare global {
    namespace JSX {
        // tslint:disable no-empty-interface
        interface Element extends VNode {}
        // tslint:disable no-empty-interface
        interface ElementClass extends Vue {}
        interface IntrinsicElements {
            [elem: string]: any;
        }
    }
    module '@vue/runtime-core' {
        // declare your own store states
        interface State {
            count: number;
        }

        // provide typings for `this.$store`
        interface ComponentCustomProperties {
            $store: Store<State>;
        }
    }
}
