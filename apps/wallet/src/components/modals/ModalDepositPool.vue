<template>
    <b-modal
        v-if="membership"
        :id="`modalDepositPool-${membership._id}`"
        @show="onShow()"
        centered
        scrollable
        title="Pool Deposit"
    >
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-if="!busy && token">
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert :show="hasInsufficientBalance" variant="warning">
                You do not have enough {{ token.symbol }} on this account.
            </b-alert>
            <b-alert :show="hasInsufficientMATICBalance" variant="warning">
                A balance of <strong>{{ maticBalance }} MATIC</strong> is not enough to pay for gas.
            </b-alert>
            <form @submit.prevent="deposit()" id="formAmount">
                <b-form-input autofocus size="lg" v-model="amount" type="number" />
            </form>
            <p class="small text-muted mt-2 mb-0">
                Your balance: <strong>{{ token.balance }} {{ token.symbol }}</strong> (
                <b-link @click="amount = Number(token.balance)">
                    Set Max
                </b-link>
                )
            </p>
        </template>
        <template v-slot:modal-footer>
            <b-button
                :disabled="hasInsufficientBalance"
                class="mt-3 btn-rounded"
                block
                variant="primary"
                form="formAmount"
                type="submit"
            >
                Deposit
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { ERC20 } from '@thxnetwork/wallet/store/modules/erc20';
import { Membership } from '@thxnetwork/wallet/store/modules/memberships';
import { TNetworks } from '@thxnetwork/wallet/store/modules/network';
import { MAX_UINT256, signCall } from '@thxnetwork/wallet/utils/network';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { fromWei, toWei } from 'web3-utils';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        privateKey: 'account/privateKey',
        erc20s: 'erc20/all',
    }),
})
export default class BaseModalDepositPool extends Vue {
    busy = false;
    error = '';
    balance = 0;
    allowance = 0;
    amount = 0;
    maticBalance = 0;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    privateKey!: string;
    erc20s!: { [id: string]: ERC20 };

    @Prop() membership!: Membership;

    get token() {
        return this.erc20s[this.membership.erc20Id];
    }

    get hasInsufficientBalance() {
        return Number(this.token.balance) < this.amount;
    }

    get hasInsufficientMATICBalance() {
        return this.maticBalance == 0;
    }

    async onShow() {
        const web3 = this.networks[this.membership.chainId];
        this.maticBalance = Number(fromWei(await web3.eth.getBalance(this.profile.address)));
        this.$store.dispatch('erc20/get', this.membership.erc20Id);
    }

    getBalance() {
        this.$store.dispatch('erc20/balanceOf', this.token);
    }

    async deposit() {
        this.busy = true;

        const { allowance } = await this.$store.dispatch('erc20/allowance', {
            token: this.token,
            owner: this.profile.address,
            spender: this.membership.poolAddress,
        });
        this.allowance = Number(allowance);

        if (this.allowance < Number(this.amount)) {
            await this.$store.dispatch('erc20/approve', {
                token: this.token,
                chainId: this.membership.chainId,
                to: this.membership.poolAddress,
                amount: toWei(String(this.amount), 'ether') || MAX_UINT256,
                poolId: this.membership.poolId,
            });
        }

        const calldata = await signCall(
            this.networks[this.membership.chainId],
            this.membership.poolAddress,
            'deposit',
            [toWei(String(this.amount), 'ether')],
            this.privateKey,
        );

        await this.$store.dispatch('deposits/create', {
            membership: this.membership,
            calldata,
            amount: this.amount,
        });

        this.$store.dispatch('memberships/get', this.membership._id);
        this.$bvModal.hide(`modalDepositPool-${this.membership._id}`);
        this.busy = false;
    }
}
</script>
