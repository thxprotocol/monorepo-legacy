<template>
    <b-button-group>
        <b-button to="/tokens" :variant="path === '/tokens' ? 'secondary' : 'darker'">
            Tokens
        </b-button>
        <b-button to="/collectibles" :variant="path === '/collectibles' ? 'secondary' : 'darker'">
            Collectibles
        </b-button>
        <b-button to="/memberships" :variant="path === '/memberships' ? 'secondary' : 'darker'">
            Memberships
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
