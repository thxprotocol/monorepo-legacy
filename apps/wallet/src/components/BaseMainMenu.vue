<template>
    <b-button-group>
        <b-button to="/coins" :variant="path === '/coins' ? 'secondary' : 'darker'"> Coins </b-button>
        <b-button to="/nft" :variant="path === '/nft' ? 'secondary' : 'darker'"> NFT </b-button>
        <b-button to="/wallets" :variant="path === '/wallets' ? 'secondary' : 'darker'"> Wallets </b-button>
    </b-button-group>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import type { Route } from 'vue-router';

@Component({})
export default class BaseMainMenu extends Vue {
    path = '';

    @Watch('$route', { immediate: true, deep: true })
    onUrlChange(newRoute: Route) {
        this.path = newRoute.path;
    }
}
</script>
