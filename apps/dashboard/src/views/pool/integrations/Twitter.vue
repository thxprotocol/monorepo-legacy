<template>
    <div v-if="pool">
        <b-alert v-if="isOwner && !twitterToken" show variant="primary" class="d-flex align-items-center">
            <i class="fab fa-discord mr-2" />
            Please connect your Twitter account!
            <b-button size="sm" variant="primary" @click="onClickConnect" class="ml-auto">Connect Twitter</b-button>
        </b-alert>
        <b-form-row>
            <b-col md="4">
                <div>
                    <strong>Automation</strong>
                </div>
                <p class="text-muted">Automatically create Repost & Like Quests for your posts on X.</p>
            </b-col>
            <b-col md="8">
                <b-form-group description="Searches for new posts in your connected account every 15 minutes">
                    <b-form-checkbox
                        v-model="isTwitterSyncEnabled"
                        :disabled="!isOwner || !twitterToken"
                        @change="updateSettings"
                        class="m-0"
                    >
                        Enable automated <strong>Twitter Quests</strong>
                        <template v-if="twitterToken && twitterToken.metadata">
                            for
                            <code> @{{ twitterToken.metadata.username }} </code>
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
                                        :disabled="isDisabled"
                                        placeholder="Quest title"
                                        v-model="defaultConditionalRewardTitle"
                                        @change="updateSettings"
                                    />
                                </b-col>
                                <b-col md="4">
                                    <b-form-input
                                        :disabled="isDisabled"
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
                                :disabled="isDisabled"
                                @change="updateSettings"
                                v-model="defaultConditionalRewardLocks"
                                :options="options"
                                multiple
                            />
                        </b-form-group>
                        <b-form-group class="mb-0">
                            <b-form-checkbox
                                v-model="defaultConditionalRewardIsPublished"
                                :disabled="isDisabled"
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
import { AccessTokenKind, QuestSocialRequirement, RewardConditionPlatform } from '@thxnetwork/types/index';
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
export default class IntegrationTwitterView extends Vue {
    account!: TAccount;
    pools!: IPools;
    questList!: TQuestState;
    AccessTokenKind = AccessTokenKind;
    QuestSocialRequirement = QuestSocialRequirement;
    isTwitterSyncEnabled = false;
    defaultConditionalRewardInteraction = QuestSocialRequirement.TwitterRetweet;
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

    get isOwner() {
        if (!this.pool.owner) return false;
        return this.pool.owner.sub === this.account.sub;
    }

    get twitterToken() {
        return this.pool.owner.tokens.find((token) => token.kind === AccessTokenKind.Twitter);
    }

    get isDisabled() {
        return !this.isOwner || !this.twitterToken || !this.isTwitterSyncEnabled;
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

    onClickConnect() {
        this.$store.dispatch('account/connectRedirect', {
            platform: RewardConditionPlatform.Twitter,
            returnUrl: window.location.href,
        });
    }
}
</script>
