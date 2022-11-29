<template>
    <b-skeleton-wrapper :loading="isLoading">
        <template #loading>
            <b-card class="mt-3 mb-3 shadow-sm cursor-pointer">
                <b-skeleton animation="fade" width="65%"></b-skeleton>
                <hr />
                <b-skeleton animation="fade" width="55%"></b-skeleton>
                <b-skeleton animation="fade" class="mb-3" width="70%"></b-skeleton>
                <b-skeleton type="button" animation="fade" class="rounded-pill" width="100%"></b-skeleton>
            </b-card>
        </template>
        <b-card class="mb-3">
            <div class="mb-3 d-flex align-items-center">
                <img height="30" class="mr-3" :src="require('../../../public/assets/logo-youtube.png')" alt="" />
                <strong> YouTube </strong>
            </div>
            <hr />
            <p class="text-muted">Connect and reward likes and subscribes.</p>
            <b-button v-if="!youtube" @click="connect()" variant="primary" block class="rounded-pill">
                Connect
            </b-button>
            <b-button v-if="youtube" variant="light" block @click="disconnect()" class="rounded-pill">
                <span class="text-danger">Disconnect</span>
            </b-button>
        </b-card>
    </b-skeleton-wrapper>
</template>

<script lang="ts">
import type { IAccount, IYoutube } from '@thxnetwork/dashboard/types/account';
import { RewardConditionPlatform } from '@thxnetwork/types/index';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({
        profile: 'account/profile',
        youtube: 'account/youtube',
    }),
})
export default class Home extends Vue {
    isLoading = false;
    youtube!: IYoutube;
    profile!: IAccount;

    mounted() {
        this.$store.dispatch('account/getYoutube').then(() => (this.isLoading = false));
    }

    connect() {
        this.$store.dispatch('account/connectRedirect', RewardConditionPlatform.Google);
    }

    disconnect() {
        this.$store
            .dispatch('account/update', { googleAccess: false })
            .then(() => this.$store.dispatch('account/getYoutube'));
    }
}
</script>
