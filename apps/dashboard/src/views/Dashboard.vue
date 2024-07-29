<template>
    <div class="d-flex h-100 flex-column">
        <BaseNavbarTop />
        <router-view style="height: calc(100% - 70px) !important" />
    </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseNavbarTop from '@thxnetwork/dashboard/components/BaseNavbarTop.vue';

@Component({
    components: {
        BaseNavbarTop,
    },
    computed: {
        ...mapGetters({
            account: 'account/profile',
        }),
    },
})
export default class App extends Vue {
    account!: TAccount;
}
</script>

<style lang="scss">
.alert-top {
    border: 0;
    border-radius: 0;
}

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
