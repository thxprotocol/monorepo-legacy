<template>
    <div v-if="settings">
        <b-form-row>
            <b-col md="4">
                <strong>Automated Rewards</strong>
                <p class="text-muted">Enable automated creation of conditional rewards for your new tweets.</p>
            </b-col>
            <b-col md="8">
                <b-alert show variant="warning" v-if="profile && !profile.twitterAccess">
                    <i class="fab fa-twitter mr-2"></i>
                    Connect your Twitter account to your THX account in order to benefit from reward automation.
                </b-alert>
                <b-form-group>
                    <b-form-checkbox v-model="settings.isTwitterSyncEnabled" @change="updateSettings()">
                        Enable automated reward creation for your Tweets
                    </b-form-checkbox>
                </b-form-group>
            </b-col>
        </b-form-row>
        <hr />
        <b-form-row>
            <b-col md="4">
                <strong>Reward defaults</strong>
                <p class="text-muted">Configure fields for automatically created conditional rewards.</p>
            </b-col>
            <b-col md="8">
                <b-card body-class="bg-light">
                    <b-form-group label="Title">
                        <b-form-input v-model="settings.defaults.conditionalRewards.title" @change="updateSettings()" />
                    </b-form-group>
                    <b-form-group label="Description">
                        <b-form-textarea
                            v-model="settings.defaults.conditionalRewards.description"
                            @change="updateSettings()"
                        />
                    </b-form-group>
                    <b-form-group label="Amount">
                        <b-form-input
                            v-model="settings.defaults.conditionalRewards.amount"
                            type="number"
                            @change="updateSettings()"
                        />
                    </b-form-group>
                </b-card>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { chainInfo } from '@thxnetwork/dashboard/utils/chains';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { TPoolSettings } from '@thxnetwork/types/index';

@Component({
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsTwitterView extends Vue {
    loading = true;
    chainInfo = chainInfo;
    profile!: IAccount;
    pools!: IPools;
    settings: TPoolSettings | null = null;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        this.settings = this.pool.settings;
    }

    async updateSettings() {
        this.loading = true;
        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: { settings: this.settings },
        });
        this.loading = false;
    }
}
</script>
