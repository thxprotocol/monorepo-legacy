<template>
    <div class="d-flex align-items-center justify-content-center mb-2 bg-dark">
        <div class="d-flex flex-column align-items-center">
            <b-alert show variant="danger" v-if="error">{{ error }}</b-alert>
            <b-spinner variant="secondary" size="lg"></b-spinner>
            <span class="text-muted mt-2">{{ info }}</span>
        </div>
        <modal-decode-private-key @init="redirect()" />
    </div>
</template>

<script lang="ts">
import { UserProfile } from '@thxnetwork/wallet/store/modules/account';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters, mapState } from 'vuex';
import { User } from 'oidc-client-ts';
import ModalDecodePrivateKey from '@thxnetwork/wallet/components/modals/ModalDecodePrivateKey.vue';
import { ChainId } from '@thxnetwork/wallet/types/enums/ChainId';
import { chainInfo } from '@thxnetwork/wallet/utils/chains';

@Component({
    components: {
        ModalDecodePrivateKey,
    },
    computed: {
        ...mapState('network', ['address']),
        ...mapGetters({
            chainId: 'network/chainId',
            profile: 'account/profile',
            user: 'account/user',
        }),
    },
})
export default class Redirect extends Vue {
    error = '';
    info = '';
    redirectPath = '/memberships';

    address!: string;
    profile!: UserProfile;
    user!: User;
    chainId!: ChainId;

    async mounted() {
        await this.redirectCallback();
        if (!this.user) await this.$store.dispatch('account/signinRedirect');

        await this.getProfile();

        // Check for non custodial account and return
        if (this.profile && this.profile.privateKey) {
            return this.$bvModal.show('modalDecodePrivateKey');
        }

        // Get private key from Torus network if applicable
        await this.getPrivateKey();

        // Connect to network
        await this.getNetwork();

        // Update account if necessary
        await this.updateAccount();

        this.redirect();
    }

    redirect() {
        const state: any = this.user.state;
        let path = state.toPath || this.redirectPath;

        // If a reward hash or claim Id is found, redirect to the claim page instead
        if (state.rewardHash || state.claimId) {
            path = '/collect';
        }

        this.$router.push(path);
    }

    async getNetwork() {
        this.info = `Connecting ${chainInfo[this.chainId].name}...`;
        await this.$store.dispatch('network/connect', this.chainId);
    }

    async redirectCallback() {
        this.info = 'Authenticating your account...';
        await this.$store.dispatch('account/signinRedirectCallback');
    }

    async getMemberships() {
        this.info = 'Fetching memberships for your account...';
        await this.$store.dispatch('memberships/getAll');
    }

    async getPrivateKey() {
        this.info = 'Fetching private key from Web3Auth...';
        await this.$store.dispatch('network/getPrivateKey', this.user);
    }

    async updateAccount() {
        this.info = 'Updating your account details with a new address...';

        // If there is no address then sign a message and patch the account
        // so the API can recoverAddress and update the account in db
        if (!this.profile.address) {
            await this.$store.dispatch('account/update', { address: this.address });
        }
    }

    async getProfile() {
        this.info = 'Fetching your account details...';
        await this.$store.dispatch('account/getProfile');
    }
}
</script>
