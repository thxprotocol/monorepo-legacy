<template>
    <div class="d-flex align-items-center justify-content-center mb-2 bg-dark">
        <div class="flex-row text-center" v-if="isClaimInvalid || isClaimFailed">
            <b-alert show variant="info" v-if="isClaimInvalid">
                {{ error }}
            </b-alert>
            <b-alert show variant="danger" v-if="isClaimFailed">
                Oops, we did not manage to claim your token reward at this time, please try again later.
            </b-alert>
            <b-button variant="primary" class="rounded-pill" @click="claimReward()" v-if="isClaimFailed">
                Try again
            </b-button>
            <b-button variant="link" @click="redirect()">Continue</b-button>
        </div>
        <div v-else class="d-flex flex-column align-items-center">
            <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
            <b-spinner variant="secondary" size="lg"></b-spinner>
            <span class="text-muted mt-2">{{ info }}</span>
        </div>
        <modal-show-withdrawal @redirect="redirect()" :withdrawal="withdrawal" v-if="withdrawal" />
        <modal-decode-private-key @init="redirect()" />
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { User } from 'oidc-client-ts';
import ModalDecodePrivateKey from '@thxnetwork/wallet/components/modals/ModalDecodePrivateKey.vue';
import ModalShowWithdrawal from '@thxnetwork/wallet/components/modals/ModalShowWithdrawal.vue';
import { TNetworks } from '@thxnetwork/wallet/store/modules/network';
import Web3 from 'web3';

@Component({
    components: {
        ModalShowWithdrawal,
        ModalDecodePrivateKey,
    },
    computed: mapGetters({
        privateKey: 'account/privateKey',
        profile: 'account/profile',
        user: 'account/user',
        networks: 'network/all',
    }),
})
export default class Redirect extends Vue {
    error = '';
    info = '';
    redirectPath = '/memberships';
    isClaimFailed = false;
    isClaimInvalid = false;

    withdrawal = null;

    // getters
    privateKey!: string;
    profile!: UserProfile;
    networks!: TNetworks;
    user!: User;

    async mounted() {
        await this.redirectCallback();

        if (!this.user) {
            await this.$store.dispatch('account/signinRedirect');
        }

        await this.getProfile();

        // Check for non custodial account and return
        if (this.profile && this.profile.privateKey) {
            await this.setNetwork(this.profile.privateKey);
            return this.$bvModal.show('modalDecodePrivateKey');
        }

        await this.getPrivateKey();
        await this.setNetwork(this.privateKey);

        // Check for first time login
        if (this.profile) {
            await this.updateAccount();
        }

        // Check for reward hash in state
        const state: any = this.user.state;
        if (state.rewardHash) {
            await this.claimReward();
        }

        if (!this.error && !this.isClaimFailed && !this.isClaimInvalid && !this.withdrawal) this.redirect();
    }

    redirect() {
        const state: any = this.user.state;
        const path = state.toPath || this.redirectPath;
        this.$router.push(path);
    }

    async setNetwork(privateKey: string) {
        this.info = 'Initializing blockchain networks...';

        if (process.env.NODE_ENV !== 'production ') {
            await this.$store.dispatch('network/setNetwork', { chainId: ChainId.Hardhat, privateKey });
        }

        await this.$store.dispatch('network/setNetwork', { chainId: ChainId.PolygonMumbai, privateKey });
        await this.$store.dispatch('network/setNetwork', { chainId: ChainId.Polygon, privateKey });
    }

    async redirectCallback() {
        this.info = 'Authenticating your account...';
        await this.$store.dispatch('account/signinRedirectCallback');
    }

    async getMemberships() {
        this.info = 'Fetching memberships for your account...';
        const { error } = await this.$store.dispatch('memberships/getAll');
        if (error) this.error = error.message;
    }

    async getPrivateKey() {
        this.info = 'Fetching private key from Web3Auth...';
        const { error } = await this.$store.dispatch('account/getPrivateKey', this.user);
        if (error) this.error = error.message;
    }

    async claimReward() {
        this.isClaimFailed = false;
        this.isClaimInvalid = false;
        this.info = 'Claiming your token reward...';

        const state: any = this.user.state;
        const { withdrawal, error } = await this.$store.dispatch('assetpools/claimReward', state.rewardHash);

        if (error) {
            this.error = error.response.data.error.message;
            this.isClaimFailed = error.response?.status === 500;
            this.isClaimInvalid = error.response?.status === 403;
        } else {
            this.withdrawal = withdrawal;
        }
    }

    async updateAccount() {
        this.info = 'Updating your account details with a new address...';

        const web3 = new Web3();
        const account = web3.eth.accounts.privateKeyToAccount(this.privateKey);

        if (!this.profile.address || this.profile.address !== account.address) {
            const error = await this.$store.dispatch('account/update', { address: account.address });
            if (error) this.error = error.message;
        }
    }

    async getProfile() {
        this.info = 'Fetching your account details...';
        await this.$store.dispatch('account/getProfile');
    }
}
</script>
