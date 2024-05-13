<template>
    <base-modal size="xl" hide-footer title="Twitter Query" :id="id" @show="onShow" :error="error">
        <template #modal-body>
            <p class="text-muted">
                Use this query builder to create requirements for posts that should be amplified with Repost & Like
                quests.
            </p>
            <b-tabs content-class="mt-3" justified>
                <b-tab title="Query Builder">
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
                <b-tab title="Quest Defaults">
                    <b-row>
                        <b-col>
                            <b-form-group label="Title">
                                <b-form-input v-model="title" />
                            </b-form-group>
                            <b-form-group label="Description">
                                <b-form-textarea v-model="description" />
                            </b-form-group>
                            <b-form-group label="Amount">
                                <b-form-input v-model="amount" type="number" />
                            </b-form-group>
                        </b-col>
                        <b-col>
                            <BaseFormGroupQuestLocks @change-locks="locks = $event" :pool="pool" :locks="locks" />
                            <b-form-group label="Minimum amount of followers">
                                <b-form-input v-model="minFollowersCount" />
                            </b-form-group>
                            <b-form-group label="Expiry in days">
                                <b-form-input v-model="expiryInDays" type="number" />
                            </b-form-group>
                            <b-form-group>
                                <b-checkbox :checked="isPublished" @change="isPublished = $event">
                                    Published
                                </b-checkbox>
                            </b-form-group>
                        </b-col>
                    </b-row>
                </b-tab>
            </b-tabs>

            <b-button
                :disabled="isLoading"
                class="rounded-pill mt-3"
                type="submit"
                @click="onClickCreate"
                variant="primary"
                block
            >
                Start Query
            </b-button>
        </template>
    </base-modal>
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
