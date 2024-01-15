<template>
    <div>
        <b-form-row>
            <b-col md="4"> </b-col>
            <b-col md="8">
                <b-alert show variant="warning" v-if="!account.twitterAccess">
                    <i class="fab fa-discord mr-2" />
                    Please <b-link to="/account">connect your X account!</b-link>!
                </b-alert>
            </b-col>
            <b-col md="4">
                <div>
                    <strong>Automation</strong>
                </div>
                <p class="text-muted">Automatically create Repost & Like Quests for your posts on X.</p>
            </b-col>
            <b-col md="8" v-if="pool.owner">
                <b-alert show variant="warning" v-if="!pool.owner.twitterAccess && pool.owner.sub === account.sub">
                    <i class="fab fa-twitter mr-2"></i>
                    <b-link @click="$store.dispatch('account/connect', AccessTokenKind.Twitter)">
                        Connect your Twitter account
                    </b-link>
                    to enable Twitter quest automation.
                </b-alert>
                <b-form-group description="Searches for new posts in your connected account every 15 minutes">
                    <b-form-checkbox
                        v-model="isTwitterSyncEnabled"
                        :disabled="!isTwitterSyncEnabled && account && !account.twitterAccess"
                        @change="updateSettings"
                        class="m-0"
                    >
                        Enable automated <strong>Twitter Quests</strong>
                        <template v-if="pool.owner.twitterAccess && pool.owner.twitterUsername">
                            for <code>@{{ pool.owner.twitterUsername }}</code>
                        </template>
                    </b-form-checkbox>
                </b-form-group>
            </b-col>
            <b-col md="4">
                <div>
                    <strong>Hashtag filter</strong>
                </div>
                <p class="text-muted">Only create Quests for posts containing a particular hashtag.</p>
            </b-col>
            <b-col md="8">
                <b-form-group
                    label="Hashtag"
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
            </b-col>
            <b-col md="4">
                <div>
                    <strong>Quest Defaults</strong>
                </div>
                <p class="text-muted">These values will be used for your automatically generated quest.</p>
            </b-col>
            <b-col md="8">
                <b-card body-class="bg-light">
                    <b-form-group class="mb-0">
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
                        <b-form-group label="Quest Locks">
                            <b-form-select
                                @change="updateSettings"
                                v-model="defaultConditionalRewardLocks"
                                :options="options"
                                multiple
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
import { IPools, TQuestState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccessTokenKind, RewardConditionInteraction, TPoolSettings } from '@thxnetwork/types/index';
import type { TAccount, TQuest, TQuestLock } from '@thxnetwork/types/interfaces';

@Component({
    computed: {
        ...mapGetters({
            pools: 'pools/all',
            questList: 'pools/quests',
            account: 'account/profile',
        }),
    },
})
export default class IntegrationTelegramView extends Vue {
    account!: TAccount;
    pools!: IPools;
    questList!: TQuestState;
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
    defaultConditionalRewardLocks: TQuestLock[] = [];

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get quests() {
        if (!this.questList[this.$route.params.id]) return [];
        return this.questList[this.$route.params.id].results;
    }

    get options() {
        return this.quests.map((quest: TQuest) => {
            return { text: quest.title, value: { variant: quest.variant, questId: quest._id } };
        });
    }

    async mounted() {
        await this.$store.dispatch('pools/listQuests', {
            pool: this.pool,
            page: 1,
            limit: 100,
            isPublished: true,
        });

        this.isTwitterSyncEnabled = this.pool.settings.isTwitterSyncEnabled;
        this.defaultConditionalHashtag = this.pool.settings.defaults.conditionalRewards.hashtag;
        this.defaultConditionalRewardTitle = this.pool.settings.defaults.conditionalRewards.title;
        this.defaultConditionalRewardDescription = this.pool.settings.defaults.conditionalRewards.description;
        this.defaultConditionalRewardAmount = this.pool.settings.defaults.conditionalRewards.amount;
        this.defaultConditionalRewardIsPublished = this.pool.settings.defaults.conditionalRewards.isPublished;
        this.defaultConditionalRewardLocks = this.pool.settings.defaults.conditionalRewards.locks.map(
            (lock: TQuestLock) => ({ questId: lock.questId, variant: lock.variant }),
        );
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
                            locks: this.defaultConditionalRewardLocks,
                        },
                    },
                },
            },
        });
    }
}
</script>
