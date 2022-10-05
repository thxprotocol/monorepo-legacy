<template>
    <b-modal :id="`modalTransferTokens-${token.address}`" @show="reset" centered scrollable title="Transfer tokens">
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-else>
            <p>
                Transfer tokens from your THX Web Wallet to another wallet address.
            </p>
            <form @submit.prevent="transfer()" id="formTransfer">
                <b-form-group>
                    <b-form-input autofocus size="lg" v-model="amount" type="number" placeholder="Amount to transfer" />
                </b-form-group>
                <b-form-group>
                    <b-form-input size="lg" v-model="to" type="text" placeholder="Address of the receiver" />
                </b-form-group>
            </form>
        </template>
        <template v-slot:modal-footer>
            <b-button class="rounded-pill" block variant="primary" form="formTransfer" type="submit">
                Transfer
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { ERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import { Membership } from '@thxnetwork/wallet/store/modules/memberships';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalTranferTokens extends Vue {
    busy = false;
    error = '';
    amount = 0;
    to = '';

    @Prop() membership!: Membership;
    @Prop() token!: ERC20;

    reset() {
        this.amount = 0;
        this.to = '';
    }

    async transfer() {
        this.busy = true;

        await this.$store.dispatch('erc20/approve', {
            token: this.token,
            chainId: this.membership.chainId,
            to: this.to,
            poolAddress: this.membership.poolAddress,
            amount: this.amount,
        });

        await this.$store.dispatch('erc20/transfer', {
            token: this.token,
            chainId: this.membership.chainId,
            to: this.to,
            amount: this.amount,
        });

        await this.$store.dispatch('erc20/balanceOf', this.token);

        this.reset();
        this.$bvModal.hide(`modalTransferTokens-${this.token.address}`);
        this.busy = false;
    }
}
</script>
