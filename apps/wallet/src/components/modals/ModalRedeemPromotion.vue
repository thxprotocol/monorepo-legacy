<template>
    <b-modal
        v-if="membership"
        :id="`modalDepositPool-${promotion.id}`"
        @show="onShow()"
        centered
        scrollable
        title="Deposit assets to this pool"
    >
        <div class="w-100 text-center" v-if="busy">
            <b-spinner variant="dark" />
        </div>
        <template v-if="!busy && erc20">
            <b-alert show variant="danger" v-if="error">
                {{ error }}
            </b-alert>
            <b-alert :show="hasInsufficientBalance" variant="warning">
                You do not have enough {{ erc20.symbol }} on this account.
            </b-alert>
            <p>
                Make a deposit of <strong>{{ promotion.price }} {{ erc20.symbol }}</strong> into the pool to unlock this
                promotion.
            </p>
            <b-form-group v-if="hasInsufficientAllowance">
                <b-form-radio v-model="amount" name="a" :value="MAX_UINT256">
                    <strong>Approve all deposits</strong>
                    <p class="text-muted">We will always be able to spend {{ erc20.symbol }} on your behalf.</p>
                </b-form-radio>
                <b-form-radio v-model="amount" name="a" :value="promotion.price">
                    <strong>Approve this deposit</strong>
                    <p class="text-muted">
                        We will spend {{ promotion.price }} {{ erc20.symbol }} on your behalf and ask for your approval
                        again for your next deposit.
                    </p>
                </b-form-radio>
            </b-form-group>
            <p class="small text-muted mt-2 mb-0" v-else>
                Your have allowed us to spend up to
                <strong>
                    {{ promotion.price }}
                    {{ erc20.symbol }}
                </strong>
                on your behalf.
            </p>
        </template>
        <template v-slot:modal-footer>
            <b-button
                :disabled="hasInsufficientBalance"
                class="mt-3 btn-rounded"
                block
                variant="primary"
                @click="deposit()"
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
import { TPromotion } from '@thxnetwork/wallet/store/modules/promotions';
import { MAX_UINT256, signCall } from '@thxnetwork/wallet/utils/network';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { toWei } from 'web3-utils';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        networks: 'network/all',
        privateKey: 'account/privateKey',
    }),
})
export default class BaseModalRedeemPromotion extends Vue {
    MAX_UINT256 = MAX_UINT256;
    busy = false;
    error = '';
    balance = 0;
    amount = MAX_UINT256;
    allowance = 0;

    // getters
    profile!: UserProfile;
    networks!: TNetworks;
    privateKey!: string;

    @Prop() membership!: Membership;
    @Prop() promotion!: TPromotion;
    @Prop() erc20!: ERC20;

    get hasInsufficientBalance() {
        return this.balance < this.promotion.price;
    }

    get hasInsufficientAllowance() {
        return this.allowance < this.promotion.price;
    }

    async onShow() {
        this.$store.dispatch('memberships/get', this.membership._id);
        this.getBalance();
        const { allowance } = await this.$store.dispatch('erc20/allowance', {
            token: this.erc20,
            owner: this.profile.address,
            spender: this.membership.poolAddress,
        });
        this.allowance = Number(allowance);
    }

    async getBalance() {
        this.balance = await this.$store.dispatch('erc20/balanceOf', this.erc20);
    }

    async deposit() {
        this.busy = true;

        if (this.allowance < Number(this.promotion.price)) {
            await this.$store.dispatch('erc20/approve', {
                token: this.erc20,
                chainId: this.membership.chainId,
                to: this.membership.poolAddress,
                poolAddress: this.membership.poolAddress,
                amount: MAX_UINT256,
            });
        }

        const calldata = await signCall(
            this.networks[this.membership.chainId],
            this.membership.poolAddress,
            'deposit',
            [toWei(String(this.promotion.price), 'ether')],
            this.privateKey,
        );

        await this.$store.dispatch('deposits/create', {
            membership: this.membership,
            calldata,
            amount: this.promotion.price,
            item: this.promotion.id,
        });

        this.$store.dispatch('promotions/filter', { membership: this.membership });
        this.$bvModal.hide(`modalDepositPool-${this.promotion.id}`);
        this.busy = false;
    }
}
</script>
