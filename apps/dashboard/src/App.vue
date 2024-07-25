<template>
    <div id="app" :class="{ 'is-authenticated': isReady }">
        <b-spinner v-if="!isReady" variant="light" class="m-auto" />
        <router-view v-else />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { initGTM } from '@thxnetwork/dashboard/utils/ga';
import { GTM } from '@thxnetwork/dashboard/config/secrets';

@Component({
    components: {},
    computed: {
        ...mapState('auth', {
            isReady: 'isReady',
        }),
    },
})
export default class App extends Vue {
    isReady!: boolean;

    created() {
        if (GTM) initGTM();
    }
}
</script>

<style lang="scss">
#app {
    opacity: 0;
    transition: 0.25s opacity ease;

    &.is-authenticated {
        opacity: 1;
    }

    &:not(.is-authenticated) {
        padding: 2rem 0 3rem;
        height: auto;

        @media (min-width: 768px) {
            height: 100%;

            .sidebar-sibling {
                height: 100%;
                margin-left: 0;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}
</style>
