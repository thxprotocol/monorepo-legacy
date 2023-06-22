<template>
    <div class="d-flex center-center h-100" v-if="!profile">
        <b-spinner variant="primary"></b-spinner>
    </div>
</template>

<script lang="ts">
import { track } from '@thxnetwork/mixpanel';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { IPools } from '../store/modules/pools';
import { TAccount } from '@thxnetwork/types/interfaces';

@Component({
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
    }),
})
export default class Redirect extends Vue {
    pools!: IPools;
    profile!: TAccount;

    async mounted() {
        await this.$store.dispatch('account/signinRedirectCallback');
        await this.$store.dispatch('account/getProfile');

        track('UserSignsIn', [this.profile]);

        this.$router.push('/');
    }
}
</script>
