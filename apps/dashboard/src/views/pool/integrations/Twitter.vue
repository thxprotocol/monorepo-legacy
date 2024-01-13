<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <div>
                    <strong>Automated Quests</strong>
                </div>
                <p class="text-muted">
                    Reduce campaign management with automated Repost & Like Quests for your tweets.
                </p>
            </b-col>
            <b-col md="8" v-if="pool.owner">
                <b-alert show variant="warning" v-if="!pool.owner.twitterAccess && pool.owner.sub === profile.sub">
                    <i class="fab fa-twitter mr-2"></i>
                    <b-link @click="$store.dispatch('account/connect', AccessTokenKind.Twitter)">
                        Connect your Twitter account
                    </b-link>
                    to enable Twitter quest automation.
                </b-alert>
                <b-form-group description="Searches for new posts in your connected account every 15 minutes">
                    <b-form-checkbox
                        v-model="isTwitterSyncEnabled"
                        :disabled="!isTwitterSyncEnabled && profile && !profile.twitterAccess"
                        @change="updateSettings"
                        class="m-0"
                    >
                        Enable automated <strong>Twitter Quests</strong>
                        <template v-if="pool.owner.twitterAccess && pool.owner.twitterUsername">
                            for <code>@{{ pool.owner.twitterUsername }}</code>
                        </template>
                    </b-form-checkbox>
                </b-form-group>
                <b-card body-class="bg-light">
                    <b-form-group
                        label="Hashtag filter"
                        description="Leave empty to create quests for all posts created by the account"
                    >
                        <b-input-group prepend="#">
                            <b-form-input
                                :disabled="!isTwitterSyncEnabled"
                                v-model="defaultConditionalHashtag"
                                @change="updateSettings"
                            />
                        </b-input-group>
                    </b-form-group>
                    <hr />
                    <b-form-group label="Default settings" class="mb-0">
                        <b-form-group>
                            <b-row>
                                <b-col md="8">
                                    <b-form-input
                                        :disabled="!isTwitterSyncEnabled"
                                        placeholder="Quest title"
                                        v-model="defaultConditionalRewardTitle"
                                        @change="updateSettings"
                                    />
                                </b-col>
                                <b-col md="4">
                                    <b-form-input
                                        :disabled="!isTwitterSyncEnabled"
                                        placeholder="Points"
                                        type="number"
                                        v-model="defaultConditionalRewardAmount"
                                        @change="updateSettings"
                                    />
                                </b-col>
                            </b-row>
                        </b-form-group>
                        <b-form-group>
                            <b-form-textarea
                                :disabled="!isTwitterSyncEnabled"
                                placeholder="Quest description"
                                v-model="defaultConditionalRewardDescription"
                                @change="updateSettings"
                            />
                        </b-form-group>
                        <b-form-group class="mb-0">
                            <b-form-checkbox
                                v-model="defaultConditionalRewardIsPublished"
                                :disabled="!isTwitterSyncEnabled"
                                @change="updateSettings"
                            >
                                Publish new quests instantly
                            </b-form-checkbox>
                        </b-form-group>
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
import { AccessTokenKind, RewardConditionInteraction, TPoolSettings } from '@thxnetwork/types/index';
import type { TAccount } from '@thxnetwork/types/interfaces';

@Component({
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class IntegrationTelegramView extends Vue {
    profile!: TAccount;
    pools!: IPools;
    AccessTokenKind = AccessTokenKind;
    RewardConditionInteraction = RewardConditionInteraction;
    settings: TPoolSettings | null = null;
    isTwitterSyncEnabled = false;
    defaultConditionalRewardInteraction = RewardConditionInteraction.TwitterRetweet;
    defaultConditionalHashtag = '';
    defaultConditionalRewardTitle = '';
    defaultConditionalRewardDescription = '';
    defaultConditionalRewardAmount = 0;
    defaultConditionalRewardIsPublished = true;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    mounted() {
        this.isTwitterSyncEnabled = this.pool.settings.isTwitterSyncEnabled;
        this.defaultConditionalHashtag = this.pool.settings.defaults.conditionalRewards.hashtag;
        this.defaultConditionalRewardTitle = this.pool.settings.defaults.conditionalRewards.title;
        this.defaultConditionalRewardDescription = this.pool.settings.defaults.conditionalRewards.description;
        this.defaultConditionalRewardAmount = this.pool.settings.defaults.conditionalRewards.amount;
        this.defaultConditionalRewardIsPublished = this.pool.settings.defaults.conditionalRewards.isPublished;
    }

    async updateSettings() {
        await this.$store.dispatch('pools/update', {
            pool: this.pool,
            data: {
                settings: {
                    isTwitterSyncEnabled: this.isTwitterSyncEnabled,
                    defaults: {
                        conditionalRewards: {
                            isPublished: this.defaultConditionalRewardIsPublished,
                            title: this.defaultConditionalRewardTitle,
                            description: this.defaultConditionalRewardDescription,
                            amount: this.defaultConditionalRewardAmount,
                            hashtag: this.defaultConditionalHashtag,
                        },
                    },
                },
            },
        });
    }
}
</script>
