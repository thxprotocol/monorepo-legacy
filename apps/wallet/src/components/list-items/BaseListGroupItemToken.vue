<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <div
            class="mr-auto d-flex align-items-center"
            v-b-tooltip
            :title="`${token.erc20.name} (${ChainId[token.erc20.chainId]})`"
        >
            <base-identicon :rounded="true" variant="dark" :size="30" :uri="token.erc20.logoImgUrl" class="mr-2" />
            <strong>{{ token.erc20.symbol }}</strong>
        </div>
        <div class="h3 mr-3 m-0">
            {{ token.balance }}
            <small v-if="Number(token.balancePending) > 0" class="text-muted">{{ token.balancePending }}</small>
        </div>
        <b-button variant="light" size="sm" @click.stop="$bvModal.show(`modalTransferTokens-${token.erc20._id}`)">
            <i class="fas fa-exchange-alt ml-0"></i>
        </b-button>
        <base-modal-transfer-tokens :erc20="token.erc20" />
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import type { TERC20Token } from '@thxnetwork/wallet/store/modules/erc20';
import BaseModalTransferTokens from '@thxnetwork/wallet/components/modals/ModalTransferTokens.vue';
import BaseIdenticon from '../BaseIdenticon.vue';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import poll from 'promise-poller';

@Component({
    components: {
        BaseModalTransferTokens,
        BaseIdenticon,
    },
})
export default class BaseListGroupItemToken extends Vue {
    ChainId = ChainId;
    profile!: UserProfile;

    @Prop() token!: TERC20Token;

    mounted() {
        this.waitForWithdrawn();
    }

    waitForWithdrawn() {
        const taskFn = async () => {
            await this.$store.dispatch('erc20/get', this.token._id);
            if (this.token.pendingWithdrawals.length) {
                return Promise.reject(`${this.token.pendingWithdrawals.length} withdrawals pending`);
            } else {
                return Promise.resolve();
            }
        };
        return poll({ taskFn, interval: 3000, retries: 10 });
    }
}
</script>
