<template>
    <b-list-group-item>
        <div class="d-flex align-items-center w-100">
            <div class="mr-auto">
                <strong>{{ walletManager.address }}</strong>
            </div>
        </div>
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TWalletManager } from '@thxnetwork/wallet/types/WalletManagers';

@Component({
    components: {},
})
export default class BaseListGroupItemWalletManager extends Vue {
    @Prop() walletManager!: TWalletManager;
}
</script>
