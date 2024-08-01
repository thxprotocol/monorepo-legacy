<template>
    <div class="h-100">
        <b-container class="m-auto h-100" fluid>
            <b-row class="h-100">
                <b-col md="6" class="h-100 d-flex align-items-center justify-content-center flex-column">
                    <div>
                        <b-img width="60" :src="require('@thxnetwork/dashboard/../public/assets/logo.png')" fluid />
                        <div>
                            <strong class="my-3 d-block font-weight-normal" :style="{ fontSize: '1.5rem' }">
                                Invite accepted
                            </strong>
                        </div>
                        <b-card>
                            <b-alert variant="success" show v-if="pool">
                                <i class="fas fa-user-plus mr-2" />
                                You have access to <strong>{{ pool.settings.title }} </strong>
                            </b-alert>
                            <b-button @click="onClickContinue" block variant="primary">
                                <b-spinner v-if="isLoading" small />
                                <template v-else>
                                    Continue
                                    <i class="fas fa-chevron-right ml-2" />
                                </template>
                            </b-button>
                        </b-card>
                    </div>
                </b-col>
                <b-col
                    :style="{
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                        backgroundImage: `url(${require('@thxnetwork/dashboard/../public/assets/bg.jpg')}) `,
                    }"
                >
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import BaseCardLogin from '@thxnetwork/dashboard/components/cards/BaseCardLogin.vue';

@Component({
    components: {
        BaseCardLogin,
    },
    computed: {
        ...mapGetters({
            account: 'account/profile',
            pools: 'pools/all',
        }),
    },
})
export default class App extends Vue {
    account!: TAccount;
    pools!: IPools;
    isLoading = false;

    get pool() {
        const { poolId } = this.$route.query;
        if (!poolId) return;
        return this.pools[poolId as string];
    }

    async mounted() {
        this.isLoading = true;
        try {
            await this.$store.dispatch('account/waitForAccount');
            if (this.account) {
                const { poolId, uuid } = this.$route.query;
                await this.$store.dispatch('pools/updateCollaborator', { poolId, uuid });
                await this.$store.dispatch('pools/list');
            }
        } catch (error) {
            console.error(error);
        } finally {
            this.isLoading = false;
        }
    }

    async onClickContinue() {
        await this.$router.push({ name: 'campaign', params: { id: this.$route.query.poolId as string } });
    }
}
</script>
