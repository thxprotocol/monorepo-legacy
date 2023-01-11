<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <div class="mr-auto d-flex align-items-center" v-b-tooltip :title="`${erc20.name} (${ChainId[erc20.chainId]})`">
            <base-identicon :rounded="true" variant="dark" :size="30" :uri="erc20.logoURI" class="mr-2" />
            <strong>{{ erc20.symbol }}</strong>
        </div>
        <div class="h3 mr-3 m-0">
            {{ erc20.balance }}
            <small class="text-muted">{{ erc20.balancePending }}</small>
        </div>
        <b-button variant="light" size="sm" @click.stop="$bvModal.show(`modalTransferTokens-${erc20._id}`)">
            <i class="fas fa-exchange-alt ml-0"></i>
        </b-button>
        <base-modal-transfer-tokens :erc20="erc20" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import type { TERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import BaseModalTransferTokens from '@thxnetwork/wallet/components/modals/ModalTransferTokens.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { WithdrawalState } from '@thxnetwork/wallet/store/modules/withdrawals';
import { poll } from 'promise-poller';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
})
export default class BaseListGroupItemToken extends Vue {
    ChainId = ChainId;
    profile!: UserProfile;

    @Prop() erc20!: TERC20;

    mounted() {
        this.$store.dispatch('erc20/balanceOf', this.erc20);
        debugger;
        this.erc20.pendingWithdrawals.forEach((w) => this.waitForWithdrawn(w));
    }

    async waitForWithdrawn(w: any) {
        const taskFn = async () => {
            const pendingWithdrawals: any[] = await this.$store.dispatch('erc20/getPendingWithdrawals', this.erc20);
            if (pendingWithdrawals.length) {
                return Promise.resolve(w);
            } else {
                return Promise.reject(w);
            }
        };
        return poll({ taskFn, interval: 3000, retries: 10 });
    }
}
</script>
