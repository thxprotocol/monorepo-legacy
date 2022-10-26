<template>
    <b-list-group-item>
        <div class="d-flex align-items-center w-auto">
            <div class="mr-auto">
                <strong>{{ walletManager.address }}</strong>
            </div>
            <div class="float-right">
                <b-button hover-class="text-danger" class="ml-1" variant="link" @click="$emit('delete', walletManager)">
                    <i class="fas fa-trash m-0"></i>
                </b-button>
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
