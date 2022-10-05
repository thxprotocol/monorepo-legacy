<template>
    <div>
        <div class="d-flex flex-column h-100">
            <template v-if="payment">
                <template v-if="payment.state === PaymentState.Requested">
                    <div class="flex-grow-1">
                        <div>
                            <b-alert variant="danger" show v-if="error">
                                <i class="fas fa-exclamation-circle mr-2"></i>
                                {{ error }}
                            </b-alert>
                            <b-alert variant="success" show>
                                <i class="fas fa-info-circle mr-2"></i>
                                The
                                <strong v-b-tooltip :title="payment.receiver">{{ payment.tokenSymbol }} Pool</strong>
                                has send you a payment request.
                            </b-alert>
                            <p class="text-left">
                                <small class="text-muted">Receiver:</small><br />
                                <b-badge
                                    :href="`${blockExplorer(payment.chainId)}/address/${payment.receiver}`"
                                    target="_blank"
                                    variant="primary"
                                    class="rounded-pill"
                                >
                                    {{ payment.receiver }}
                                    <i
                                        v-b-tooltip
                                        title="View details of this account on the block explorer"
                                        class="fas fa-external-link-alt mx-1"
                                    ></i>
                                </b-badge>
                            </p>
                            <p class="text-left">
                                <small class="text-muted">Connected:</small><br />
                                <b-badge
                                    @click="$bvModal.show('modalPaymentConnect')"
                                    variant="primary"
                                    class="rounded-pill cursor-pointer"
                                    v-if="!account && !profile"
                                >
                                    <i class="fas fa-exclamation-circle mx-1"></i>
                                    Connect account
                                </b-badge>
                                <b-badge
                                    :href="`${blockExplorer(payment.chainId)}/address/${account}`"
                                    target="_blank"
                                    variant="primary"
                                    class="rounded-pill"
                                    v-if="account"
                                >
                                    {{ account }}
                                    <i
                                        v-b-tooltip
                                        title="View details of this account on the block explorer"
                                        class="fas fa-external-link-alt mx-1"
                                    ></i>
                                </b-badge>
                                <b-badge
                                    :href="`${blockExplorer(payment.chainId)}/address/${profile.address}`"
                                    target="_blank"
                                    variant="primary"
                                    class="rounded-pill"
                                    v-if="profile"
                                >
                                    {{ profile.address }}
                                    <i
                                        v-b-tooltip
                                        title="View details of this account on the block explorer"
                                        class="fas fa-external-link-alt mx-1"
                                    ></i>
                                </b-badge>
                            </p>
                            <p class="text-left">
                                <small class="text-muted">Balance:</small><br />
                                <strong class="text-primary">{{ balance }} {{ payment.tokenSymbol }}</strong>
                            </p>
                        </div>
                    </div>
                    <b-button
                        :disabled="!profile && !account"
                        @click="pay()"
                        variant="primary"
                        block
                        class="rounded-pill mb-1"
                    >
                        Pay <strong> {{ fromWei(payment.amount, 'ether') }} {{ payment.tokenSymbol }} </strong>
                    </b-button>
                    <p class="text-muted text-center small m-0">
                        <i class="fas fa-lock mr-1"></i>
                        You only approve for the requested payment and transfers are securely relayed through our relay
                        service.
                    </p>
                </template>
                <div v-if="payment.state === PaymentState.Pending" class="flex-grow-1 center-center">
                    <div class="text-center">
                        <b-spinner variant="gray" class="mb-2" />
                        <p class="text-gray">Payment is being processed</p>
                    </div>
                </div>
                <div v-if="payment.state === PaymentState.Completed" class="flex-grow-1 center-center">
                    <div class="text-center">
                        <i class="fas fa-thumbs-up text-success mb-3" style="font-size: 3rem;"></i>
                        <p class="text-gray"><strong>THX!</strong> This payment has been completed.</p>
                        <b-button class="rounded-pill" variant="primary" :href="payment.successUrl">
                            Continue to merchant
                            <i class="fas fa-chevron-right ml-2"></i>
                        </b-button>
                    </div>
                </div>
                <div v-if="payment.state === PaymentState.Failed" class="flex-grow-1 center-center">
                    <div class="text-center">
                        <i class="fas fa-exclamation-circle text-danger mb-3" style="font-size: 3rem;"></i>
                        <p class="text-gray">Your payment has not been processed.</p>
                        <b-button class="rounded-pill" variant="primary" :href="payment.failUrl">
                            <i class="fas fa-chevron-left mr-2"></i>
                            Back to merchant
                        </b-button>
                    </div>
                </div>
            </template>
            <div class="flex-grow-1 d-flex align-items-center justify-content-center" v-else>
                <b-spinner variant="primary" />
            </div>
        </div>
        <base-modal-payment-connect
            :account="account"
            :is-connected="isConnected"
            :profile="profile"
            :chainId="chainId"
            :payment="payment"
        />
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { TNetworks } from '@thxnetwork/wallet/store/modules/network';
import { PaymentState, TPayment } from '@thxnetwork/wallet/types/Payments';
import { signCall } from '@thxnetwork/wallet/utils/network';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { fromWei } from 'web3-utils';
import BaseModalPaymentConnect from '@thxnetwork/wallet/components/modals/ModalPaymentConnect.vue';
import promisePoller from 'promise-poller';
import { default as ERC20Abi } from '@thxnetwork/artifacts/dist/exports/abis/ERC20.json';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';

@Component({
    components: {
        BaseModalPaymentConnect,
    },
    computed: {
        ...mapState('metamask', ['account', 'chainId']),
        ...mapState('payments', ['payment']),
        ...mapGetters({
            networks: 'network/all',
            profile: 'account/profile',
            privateKey: 'account/privateKey',
            isConnected: 'metamask/isConnected',
        }),
    },
})
export default class Payment extends Vue {
    PaymentState = PaymentState;
    account!: string;
    privateKey!: string;
    chainId!: ChainId;
    networks!: TNetworks;
    payment!: TPayment;
    profile!: UserProfile;
    isConnected!: boolean;
    error = '';
    loading = false;
    fromWei = fromWei;
    balanceInWei = '';

    get balance() {
        return fromWei(this.balanceInWei);
    }

    blockExplorer = (chainId: number) => chainInfo[chainId].blockExplorer;

    created() {
        this.$store
            .dispatch('payments/read', {
                paymentId: this.$route.params.id,
                accessToken: this.$route.query.accessToken,
            })
            .then(() => {
                if (this.payment.state === PaymentState.Pending) return this.waitForPaymentCompleted();
                if (this.payment.state !== PaymentState.Requested) return;

                if (!this.account && !this.profile) {
                    return this.$bvModal.show('modalPaymentConnect');
                }

                this.getBalance();
            });
    }

    async signin() {
        const toPath = window.location.href.substring(window.location.origin.length);
        this.$store.dispatch('account/signinRedirect', { toPath });
    }

    async connect() {
        this.$store.dispatch('metamask/checkPreviouslyConnected');

        if (!this.isConnected) {
            await this.$store.dispatch('metamask/connect');
        }

        if (this.chainId !== this.payment.chainId) {
            await this.$store.dispatch('metamask/requestSwitchNetwork', this.payment.chainId);
        }

        this.getBalance();
        this.$bvModal.hide('modalPaymentConnect');
    }

    async getBalance() {
        const web3 = this.networks[this.payment.chainId as ChainId];
        const contract = new web3.eth.Contract(ERC20Abi as any, this.payment.tokenAddress);
        const wei = await contract.methods.balanceOf(this.profile ? this.profile.address : this.account).call();
        this.balanceInWei = wei;
    }

    waitForPaymentCompleted() {
        const taskFn = async () => {
            const payment = await this.$store.dispatch('payments/read', {
                paymentId: this.payment._id,
                accessToken: this.payment.token,
            });

            switch (payment.state) {
                case PaymentState.Completed:
                case PaymentState.Failed:
                case PaymentState.Requested: {
                    this.loading = false;
                    return Promise.resolve(payment);
                }
                case PaymentState.Pending: {
                    return Promise.reject(payment);
                }
            }
        };

        promisePoller({
            taskFn,
            interval: 1500,
            retries: 50,
        });
    }
    async pay() {
        try {
            this.loading = true;
            let data;
            if (this.account) data = await this.payWithMetamask();
            if (this.profile) data = await this.payDefault();

            await this.$store.dispatch('payments/pay', data);

            this.waitForPaymentCompleted();
        } catch (error) {
            this.error = String(error);
            await this.$store.dispatch('payments/read', {
                paymentId: this.payment._id,
                accessToken: this.payment.token,
            });
            this.loading = false;
        }
    }

    async payDefault() {
        const web3 = this.networks[this.payment.chainId as ChainId];
        const { call, nonce, sig } = await signCall(
            web3,
            this.payment.receiver,
            'topup',
            [this.payment.amount],
            this.privateKey,
        );

        await this.$store.dispatch('network/approve', this.payment);

        return { call, nonce, sig };
    }

    async payWithMetamask() {
        const { call, nonce, sig } = await this.$store.dispatch('metamask/sign', {
            poolAddress: this.payment.receiver,
            method: 'topup',
            params: [this.payment.amount],
        });

        await this.$store.dispatch('metamask/approve', {
            amount: this.payment.amount,
            spender: this.payment.receiver,
            tokenAddress: this.payment.tokenAddress,
        });

        return { call, nonce, sig };
    }
}
</script>
