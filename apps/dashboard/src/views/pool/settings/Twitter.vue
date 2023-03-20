<template>
    <div v-if="settings">
        <b-form-row>
            <b-col md="4">
                <strong>Automated Rewards</strong>
                <p class="text-muted">
                    Checks every 15min if new tweets are posted and creates conditional rewards for them.
                </p>
            </b-col>
            <b-col md="8">
                <b-alert show variant="warning" v-if="profile && !profile.twitterAccess">
                    <i class="fab fa-twitter mr-2"></i>
                    <b-link @click="$store.dispatch('account/connect', AccessTokenKind.Twitter)">
                        Connect your Twitter account
                    </b-link>
                    to benefit from reward automation.
                </b-alert>
                <b-form-group>
                    <b-form-checkbox
                        v-model="settings.isTwitterSyncEnabled"
                        :disabled="!settings.isTwitterSyncEnabled && profile && !profile.twitterAccess"
                        @change="updateSettings()"
                    >
                        Enable automated reward creation for your Tweets
                    </b-form-checkbox>
                </b-form-group>
            </b-col>
        </b-form-row>
        <b-form-row>
            <b-col md="4"> </b-col>
            <b-col md="8">
                <p class="text-muted">
                    We will use these values as a default when automatically creating your conditional rewards. You can
                    always change them later individually.
                </p>
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
import { AccessTokenKind, TPoolSettings } from '@thxnetwork/types/index';
import { BASE_URL } from '@thxnetwork/dashboard/utils/secrets';

@Component({
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsTwitterView extends Vue {
    BASE_URL = BASE_URL;
    AccessTokenKind = AccessTokenKind;
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
