<template>
    <div class="d-flex center-center h-100" v-if="!profile">
        <b-spinner variant="primary"></b-spinner>
    </div>
</template>

<script lang="ts">
import { track } from '@thxnetwork/common/mixpanel';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { User } from 'oidc-client-ts';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
        user: 'account/user',
    }),
})
export default class Redirect extends Vue {
    pools!: IPools;
    profile!: TAccount;
    user!: User;

    async mounted() {
        await this.$store.dispatch('account/signinRedirectCallback');
        await this.$store.dispatch('account/getProfile');

        track('UserSignsIn', [this.profile]);

        if (this.user && this.user.state) {
            // This handles a collaborator request while being signed in
            const { poolId, collaboratorRequestToken, returnPath } = this.user.state as any;
            if (poolId && collaboratorRequestToken) {
                await this.updateCollaborator(poolId, collaboratorRequestToken);
                this.$router.push({ name: 'pool', params: { id: poolId } });
                return;
            }

            if (returnPath) {
                this.$router.push(returnPath);
                return;
            }
        }

        this.$router.push('/');
    }

    async updateCollaborator(poolId: string, uuid: string) {
        try {
            await this.$store.dispatch('pools/updateCollaborator', { poolId, uuid });
            await this.$bvToast.toast('Accepted collaboration request!', {
                variant: 'info',
                title: 'Info',
                noFade: true,
                noAutoHide: true,
                appendToast: true,
                solid: true,
            });
        } catch (error) {
            throw error;
        }
    }
}
</script>
