<template>
    <div v-if="pool">
        <b-alert v-if="!isConnected" show variant="primary" class="d-flex align-items-center">
            <i class="fab fa-discord mr-2" />
            Please connect your Twitter account!
            <b-button size="sm" variant="primary" @click="onClickConnect" class="ml-auto">Connect Twitter</b-button>
        </b-alert>
        <b-form-row>
            <b-col md="4">
                <div>
                    <strong>Quest Automation</strong>
                </div>
                <p class="text-muted">
                    Automatically create Repost & Like quests for posts on Twitter that match your requirements.
                </p>
                <ul class="text-muted">
                    <li>Results are sorted by recency</li>
                    <li>Up to 10 quests are created per search</li>
                </ul>
            </b-col>
            <b-col md="8">
                <b-form-group label-class="d-flex ">
                    <template #label>
                        Queries
                        <b-button
                            variant="primary"
                            v-b-modal="`modalTwitterQueryCreate`"
                            class="rounded-pill ml-auto"
                            size="sm"
                        >
                            Add Query
                        </b-button>
                        <BaseModalTwitterQueryCreate :id="`modalTwitterQueryCreate`" :pool="pool" />
                    </template>
                    <BTable :items="queries" hover show-empty responsive="lg">
                        <template #head(queryString)>Query</template>
                        <template #head(frequency)>Repeat (hours)</template>
                        <template #head(createdAt)>Created</template>
                        <template #head(query)> &nbsp; </template>
                        <template #cell(queryString)="{ item }">
                            <code>{{ item.queryString }}</code>
                        </template>
                        <template #cell(createdAt)="{ item }">
                            <small class="text-muted">
                                {{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}
                            </small>
                        </template>
                        <template #cell(frequency)="{ item }">
                            <i class="fas fa-repeat text-muted mr-2"></i>{{ item.frequency }}
                        </template>
                        <template #cell(query)="{ item }">
                            <b-dropdown variant="link" size="sm" right no-caret>
                                <template #button-content>
                                    <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                                </template>
                                <b-dropdown-item @click="onClickDelete(item.query)"> Delete </b-dropdown-item>
                            </b-dropdown>
                            <BaseModalTwitterQueryCreate
                                :id="`modalTwitterQueryCreate-${item.query._id}`"
                                :pool="pool"
                                :query="item.query"
                            />
                        </template>
                    </BTable>
                </b-form-group>
            </b-col>
        </b-form-row>
    </div>
</template>
<script lang="ts">
import { IPools, TQuestState, TTwitterQueryState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { AccessTokenKind, OAuthRequiredScopes } from '@thxnetwork/common/enums';
import { format } from 'date-fns';
import BaseModalTwitterQueryCreate from '@thxnetwork/dashboard/components/modals/BaseModalTwitterQueryCreate.vue';

@Component({
    components: {
        BaseModalTwitterQueryCreate,
    },
    computed: {
        ...mapGetters({
            account: 'account/profile',
            pools: 'pools/all',
            questList: 'pools/quests',
            twitterQueryList: 'pools/twitterQueries',
        }),
    },
})
export default class IntegrationTwitterView extends Vue {
    account!: TAccount;
    pools!: IPools;
    questList!: TQuestState;
    twitterQueryList!: TTwitterQueryState;
    isLoading = false;
    format = format;

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

    get queries() {
        if (!this.twitterQueryList[this.$route.params.id]) return [];
        return Object.values(this.twitterQueryList[this.$route.params.id]).map((query) => {
            return {
                queryString: query.query,
                frequency: query.frequencyInHours,
                posts: query.posts.length,
                createdAt: query.createdAt,
                query,
            };
        });
    }

    get isConnected() {
        if (!this.pool.owner) return;
        return this.pool.owner.tokens.find(
            ({ kind, scopes }) =>
                kind === AccessTokenKind.Twitter &&
                OAuthRequiredScopes.TwitterAutoQuest.every((scope) => scopes.includes(scope)),
        );
    }

    get isDisabled() {
        return !this.isConnected;
    }

    mounted() {
        this.$store.dispatch('pools/listTwitterQueries', {
            pool: this.pool,
        });
        this.$store.dispatch('pools/listQuests', {
            pool: this.pool,
            page: 1,
            limit: 100,
            isPublished: true,
        });
    }

    onClickDelete(query: TTwitterQuery) {
        this.$store.dispatch('pools/removeTwitterQuery', { query });
    }

    onClickConnect() {
        this.$store.dispatch('account/connectRedirect', {
            kind: AccessTokenKind.Twitter,
            scopes: OAuthRequiredScopes.TwitterAutoQuest,
            returnUrl: window.location.href,
        });
    }
}
</script>
