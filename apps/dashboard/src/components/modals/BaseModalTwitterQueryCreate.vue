<template>
    <BaseModal size="xl" hide-footer title="Twitter Query" :id="id" @show="onShow" :error="error">
        <template #modal-body>
            <b-tabs v-model="tabIndex" content-class="mt-3" justified>
                <b-tab title="Quest Content">
                    <b-alert v-if="!isQueryValid" variant="primary" show>
                        <i class="fas fa-exclamation-circle mr-2" />
                        Please use the <b-link @click="tabIndex = 1">Query Builder</b-link> to create a valid search
                        query that we can use to find your posts.
                    </b-alert>
                    <p class="text-muted">
                        Set the defaults for the Repost & Like quests that are created when matches for your query are
                        found.
                    </p>
                    <b-row>
                        <b-col>
                            <BaseFormGroup required label="Title">
                                <b-form-input v-model="title" />
                            </BaseFormGroup>
                            <BaseFormGroup label="Description">
                                <b-form-textarea v-model="description" />
                            </BaseFormGroup>
                            <BaseFormGroup required label="Amount">
                                <b-form-input v-model="amount" type="number" />
                            </BaseFormGroup>
                        </b-col>
                        <b-col>
                            <BaseFormGroupQuestLocks @change-locks="locks = $event" :pool="pool" :locks="locks" />
                            <BaseFormGroup label="Minimum amount of followers">
                                <b-form-input v-model="minFollowersCount" />
                            </BaseFormGroup>
                            <BaseFormGroup label="Expiry in days">
                                <b-form-input v-model="expiryInDays" type="number" />
                            </BaseFormGroup>
                            <BaseFormGroup>
                                <b-checkbox :checked="isPublished" @change="isPublished = $event">
                                    Published
                                </b-checkbox>
                            </BaseFormGroup>
                        </b-col>
                    </b-row>
                </b-tab>
                <b-tab title="Search Posts">
                    <p class="text-muted">
                        Use this query builder to create requirements for posts that should be amplified with Repost &
                        Like quests.
                    </p>
                    <b-row>
                        <b-col>
                            <BaseCardTwitterQueryOperators
                                :from="from"
                                @from="set('from', $event)"
                                :to="to"
                                @to="set('to', $event)"
                                :text="text"
                                @text="set('text', $event)"
                                :url="url"
                                @url="set('url', $event)"
                                :hashtags="hashtags"
                                @hashtags="set('hashtags', $event)"
                                :mentions="mentions"
                                @mentions="set('mentions', $event)"
                                :media="media"
                                @media="set('media', $event)"
                                :excludes="excludes"
                                @excludes="set('excludes', $event)"
                            />
                        </b-col>
                        <b-col>
                            <BaseCardTwitterPostPreviews :operators="operators" />
                        </b-col>
                    </b-row>
                </b-tab>
            </b-tabs>
            <b-button
                :disabled="isDisabled"
                class="rounded-pill mt-3"
                type="submit"
                @click="onClickCreate"
                variant="primary"
                block
            >
                Start Query
            </b-button>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TwitterQuery } from '@thxnetwork/common/twitter';
import BaseModal from './BaseModal.vue';
import BaseCardTwitterPostPreviews from '@thxnetwork/dashboard/components/cards/BaseCardTwitterPostPreviews.vue';
import BaseCardTwitterQueryOperators, {
    excludeOptions,
} from '@thxnetwork/dashboard/components/cards/BaseCardTwitterQueryOperators.vue';
import BaseFormGroupQuestLocks from '@thxnetwork/dashboard/components/form-group/BaseFormGroupQuestLocks.vue';
import { mapGetters } from 'vuex';

@Component({
    components: {
        BaseModal,
        BaseCardTwitterPostPreviews,
        BaseCardTwitterQueryOperators,
        BaseFormGroupQuestLocks,
    },
    computed: mapGetters({
        questList: 'pools/quests',
    }),
})
export default class BaseModalTwitterQueryCreate extends Vue {
    isLoading = false;
    isCopied = false;
    error = '';
    tabIndex = 0;

    // operators
    from: string[] = [];
    to: string[] = [];
    text: string[] = [];
    url: string[] = [];
    hashtags: string[] = [];
    mentions: string[] = [];
    media: string | null = null;
    excludes: string[] = [excludeOptions[0].value, excludeOptions[1].value, excludeOptions[2].value];

    // defaults
    title = '';
    description = '';
    amount = 50;
    minFollowersCount = 50;
    expiryInDays = 0;
    locks = [];
    isPublished = false;

    questList!: TQuest[];

    @Prop() id!: string;
    @Prop() query!: TTwitterQuery;
    @Prop() pool!: TPool;

    get quests() {
        if (!this.questList[this.pool._id]) return [];
        return this.questList[this.pool._id].results;
    }

    get options() {
        return this.quests.map((quest: TQuest) => {
            return { text: quest.title, value: { variant: quest.variant, questId: quest._id } };
        });
    }

    get queryPreview() {
        return TwitterQuery.create(this.operators);
    }

    get isQueryValid() {
        return this.queryPreview !== '-is:retweet -is:quote -is:reply';
    }

    get isDisabled() {
        const isTitleValid = this.title.length > 0;
        return !this.isQueryValid || !isTitleValid || this.isLoading;
    }

    onShow() {
        if (!this.query) return;

        this.from = this.query.operators.from ? this.query.operators.from : this.from;
        this.to = this.query.operators.to ? this.query.operators.to : this.to;
        this.text = this.query.operators.text ? this.query.operators.text : this.text;
        this.url = this.query.operators.url ? this.query.operators.url : this.url;
        this.hashtags = this.query.operators.hashtags ? this.query.operators.hashtags : this.hashtags;
        this.mentions = this.query.operators.mentions ? this.query.operators.mentions : this.mentions;
        this.media = this.query.operators.media ? this.query.operators.media : this.media;
        this.excludes = this.query.operators.excludes ? this.query.operators.excludes : this.excludes;

        this.title = this.query.defaults.title ? this.query.defaults.title : this.title;
        this.description = this.query.defaults.description ? this.query.defaults.description : this.description;
        this.amount = this.query.defaults.amount ? this.query.defaults.amount : this.amount;
        this.isPublished = this.query.defaults.isPublished ? this.query.defaults.isPublished : this.isPublished;
        this.expiryInDays = this.query.defaults.expiryInDays ? this.query.defaults.expiryInDays : this.expiryInDays;
        this.minFollowersCount = this.query.defaults.minFollowersCount
            ? this.query.defaults.minFollowersCount
            : this.minFollowersCount;
    }

    get operators() {
        return {
            from: this.from,
            to: this.to,
            text: this.text,
            url: this.url,
            hashtags: this.hashtags,
            mentions: this.mentions,
            media: this.media,
            excludes: this.excludes,
        };
    }

    get defaults() {
        return {
            title: this.title,
            description: this.description,
            amount: this.amount,
            isPublished: this.isPublished,
            minFollowersCount: this.minFollowersCount,
            expiryInDays: this.expiryInDays,
            locks: this.locks,
        };
    }

    set(key: string, value: string[]) {
        this[key] = [];
        this[key] = value;
    }

    async onClickCreate() {
        this.isLoading = true;
        try {
            const operators = TwitterQuery.stringify(this.operators);
            await this.$store.dispatch('pools/createTwitterQuery', {
                pool: this.pool,
                data: { operators, defaults: this.defaults },
            });
            this.$store.dispatch('pools/listTwitterQueries', { pool: this.pool });
            this.$bvModal.hide(this.id);
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
