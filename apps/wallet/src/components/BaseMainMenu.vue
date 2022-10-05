<template>
    <b-button-group size="md">
        <b-button to="/wallet" :variant="path === '/wallet' ? 'secondary' : 'darker'">
            Wallet
        </b-button>
        <b-button to="/memberships" :variant="path === '/memberships' ? 'secondary' : 'darker'">
            Pools
        </b-button>
    </b-button-group>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Route } from 'vue-router';

@Component({})
export default class BaseMainMenu extends Vue {
    path = '';

    @Watch('$route', { immediate: true, deep: true })
    onUrlChange(newRoute: Route) {
        this.path = newRoute.path;
    }
}
</script>
