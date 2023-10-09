<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Quests</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-dropdown no-caret variant="primary" toggle-class="rounded-pill" right>
                    <template #button-content>
                        <i class="fas fa-plus mr-2 ml-0"></i>
                        New Quest
                    </template>
                    <b-dropdown-item-button
                        v-for="(variant, key) of Object.keys(QuestVariant).filter((v) => isNaN(Number(v)))"
                        :key="key"
                        v-b-modal="`${questModalComponentMap[QuestVariant[variant]]}-${variant}`"
                        :disabled="QuestVariant[variant] === QuestVariant.Custom && !hasPremiumAccess(pool.owner)"
                        button-class="d-flex px-2"
                    >
                        <b-media>
                            <template #aside>
                                <div
                                    class="p-3 rounded d-flex align-items-center justify-content-center"
                                    style="width: 50px"
                                    :style="{
                                        'background-color': contentQuests[`${variant.toLowerCase()}-quest`].color,
                                    }"
                                    v-b-tooltip.hover.bottom
                                    :title="contentQuests[`${variant.toLowerCase()}-quest`].description"
                                >
                                    <i
                                        :class="contentQuests[`${variant.toLowerCase()}-quest`].icon"
                                        class="text-white"
                                    />
                                </div>
                            </template>
                            {{ contentQuests[`${variant.toLowerCase()}-quest`].tag }}
                            <p class="text-muted small mb-0">
                                {{ contentQuests[`${variant.toLowerCase()}-quest`].title }}
                            </p>
                            <component
                                @submit="listQuests"
                                :variant="variant"
                                :is="questModalComponentMap[QuestVariant[variant]]"
                                :id="`${questModalComponentMap[QuestVariant[variant]]}-${variant}`"
                                :total="allQuests.length"
                                :pool="pool"
                            />
                        </b-media>
                    </b-dropdown-item-button>
                </b-dropdown>
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :total-rows="total"
                :selectedItems="selectedItems"
                :actions="actions"
                toggle-label="Show all"
                @toggle="isUnpublishedShown = $event"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />

            <BTable
                id="table-quests"
                hover
                :busy="isLoading"
                :items="allQuests"
                responsive="lg"
                show-empty
                :tbody-tr-class="rowClass"
            >
                <!-- Head formatting -->
                <template #head(index)> &nbsp; </template>
                <template #head(checkbox)>
                    <b-form-checkbox @change="onChecked" />
                </template>
                <template #head(variant)> Variant </template>
                <template #head(title)> Title </template>
                <template #head(points)> Points </template>
                <template #head(entries)> Entries </template>
                <template #head(quest)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(index)="{ item, index }">
                    <div class="btn btn-sort p-0">
                        <b-link block @click="onClickUp(item, index)">
                            <i class="fas fa-caret-up ml-0"></i>
                        </b-link>
                        <b-link block @click="onClickDown(item, index)">
                            <i class="fas fa-caret-down ml-0"></i>
                        </b-link>
                    </div>
                </template>
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.quest" v-model="selectedItems" />
                </template>
                <template #cell(variant)="{ item }">
                    <b-badge variant="light" class="p-2">{{ QuestVariant[item.variant] }} </b-badge>
                </template>
                <template #cell(points)="{ item }">
                    <strong class="text-primary">{{ item.points }} </strong>
                </template>
                <template #cell(title)="{ item }"> {{ item.title }} </template>
                <template #cell(entries)="{ item }">
                    <template v-if="item.variant === QuestVariant.Invite">
                        <b-link v-b-modal="`modalReferralQuestClaims${item.quest._id}`" v-if="item.entries">
                            <small><i class="fas text-muted fa-users mr-1" /></small>
                            {{ item.entries.length }}
                        </b-link>
                        <BaseModalQuestInviteClaims
                            :id="`modalReferralQuestClaims${item.quest._id}`"
                            :pool="pool"
                            :reward="quests[$route.params.id].results.find((q) => q._id === item.quest._id)"
                        />
                    </template>
                    <BaseBtnQuestEntries
                        v-if="[QuestVariant.Twitter, QuestVariant.YouTube, QuestVariant.Discord].includes(item.variant)"
                        :pool="pool"
                        :quest="item.quest"
                    />
                </template>
                <template #cell(quest)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="questModalComponentMap[item.variant] + item.quest._id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item @click="onClickDelete(item.quest)"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <component
                        @submit="listQuests"
                        :is="questModalComponentMap[item.variant]"
                        :id="questModalComponentMap[item.variant] + item.quest._id"
                        :pool="pool"
                        :total="allQuests.length"
                        :reward="quests[$route.params.id].results.find((q) => q._id === item.quest._id)"
                    />
                </template>
            </BTable>
        </BCard>
    </div>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TBaseReward, TQuest } from '@thxnetwork/types/interfaces';
import { QuestVariant } from '@thxnetwork/types/enums';
import BaseModalQuestDailyCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestDailyCreate.vue';
import BaseModalQuestSocialCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestSocialCreate.vue';
import BaseModalQuestInviteCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestInviteCreate.vue';
import BaseModalQuestCustomCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCustomCreate.vue';
import BaseModalQuestWeb3Create from '@thxnetwork/dashboard/components/modals/BaseModalQuestWeb3Create.vue';
import BaseModalQuestInviteClaims from '@thxnetwork/dashboard/components/modals/BaseModalQuestInviteClaims.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseBtnQuestEntries from '@thxnetwork/dashboard/components/buttons/BaseBtnQuestEntries.vue';
import { hasPremiumAccess } from '@thxnetwork/common';
import { TQuestState } from '@thxnetwork/dashboard/store/modules/pools';

export const contentQuests = {
    'steam-quest': {
        tag: 'Steam Quest',
        icon: 'fab fa-steam',
        title: 'Unlock Steam engagement',
        description: 'Embark on a gaming journey by purchasing, wishlisting games, and earning Steam achievements.',
        list: ['Buy a game on Steam', 'Wishlist a game on Steam', 'Earn a Steam achievement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/daily-quests',
        color: '#171d25',
    },
    'twitter-quest': {
        tag: 'Twitter Quest',
        icon: 'fab fa-twitter',
        title: 'Boost your Twitter presence',
        description: 'Engage your audience on Twitter by creating exciting quests that encourage retweets and likes.',
        list: ['Increase followers', 'Enhance brand recognition', 'Foster community engagement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/social-quests',
        color: '#1B95E0',
    },
    'daily-quest': {
        tag: 'Daily Quest',
        title: 'Boost user engagement',
        icon: 'fas fa-calendar',
        description: 'Provide daily incentives for returning to your website.',
        list: ['Encourage regular visits', 'Enhance user loyalty', 'Foster community growth'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/daily-quests',
        color: '#4CAF50',
    },
    'custom-quest': {
        tag: 'Custom Quest',
        icon: 'fas fa-trophy',
        title: 'Seamless integration',
        description: 'Integrate quests with ease using webhooks to reward important achievements in your application.',
        list: ['Tailor rewards to your app', 'Streamline integration', 'Enhance user experience'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/custom-quests',
        color: '#9370DB',
    },
    'youtube-quest': {
        tag: 'Youtube Quest',
        icon: 'fab fa-youtube',
        title: 'Expand your YouTube presence',
        description:
            'Amplify your presence on YouTube by creating quests that encourage likes, shares, and subscriptions.',
        list: ['Increase video views', 'Boost channel subscribers', 'Enhance YouTube community engagement'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/social-quests',
        color: '#FF0000',
    },
    'invite-quest': {
        tag: 'Invite Quest',
        icon: 'fas fa-comments',
        title: 'Drive user acquisition',
        description: 'Empower your players to earn rewards for referrals.',
        list: ['Expand your user base', 'Lower acquisition costs', 'Strengthen player networks'],
        docsUrl: 'https://docs.thx.network/user-guides/quests/referral-quests',
        color: '#FFA500',
    },
    'discord-quest': {
        tag: 'Discord Quest',
        icon: 'fab fa-discord',
        title: 'Strengthen your Discord community',
        description:
            'Create quests on Discord to promote community interactions and build a strong, engaged user base.',
        list: ['Grow your Discord server', 'Enhance community participation', 'Boost server activity'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
        color: '#5865F2',
    },
    'web3-quest': {
        tag: 'Web3 Quest',
        icon: 'fab fa-ethereum',
        title: 'Empower with Web3 rewards',
        description: "Reward users' coin balance or NFT ownership using smart contracts.",
        list: ['Leverage blockchain technology', 'Enhance user ownership', 'Facilitate decentralized rewards'],
        docsUrl: 'https://docs.thx.network/user-guides/quests',
        color: '#3C3C3D',
    },
};
@Component({
    components: {
        BaseCardTableHeader,
        BaseBtnQuestEntries,
        BaseModalQuestDailyCreate,
        BaseModalQuestSocialCreate,
        BaseModalQuestCustomCreate,
        BaseModalQuestWeb3Create,
        BaseModalQuestInviteCreate,
        BaseModalQuestInviteClaims,
    },
    computed: mapGetters({
        pools: 'pools/all',
        quests: 'pools/quests',
        totals: 'dailyRewards/totals',
    }),
})
export default class QuestsView extends Vue {
    hasPremiumAccess = hasPremiumAccess;
    contentQuests = contentQuests;
    actions = [{ label: 'Delete all', variant: 0 }];
    isLoading = true;
    limit = 20;
    page = 1;
    selectedItems: TQuest[] = [];
    QuestVariant = QuestVariant;
    questModalComponentMap = {
        [QuestVariant.Daily]: 'BaseModalQuestDailyCreate',
        [QuestVariant.Invite]: 'BaseModalQuestInviteCreate',
        [QuestVariant.Twitter]: 'BaseModalQuestSocialCreate',
        [QuestVariant.YouTube]: 'BaseModalQuestSocialCreate',
        [QuestVariant.Discord]: 'BaseModalQuestSocialCreate',
        [QuestVariant.Custom]: 'BaseModalQuestCustomCreate',
        [QuestVariant.Web3]: 'BaseModalQuestWeb3Create',
    };
    questIconClassMap = {
        [QuestVariant.Daily]: 'fas fa-calendar',
        [QuestVariant.Invite]: 'fas fa-comments',
        [QuestVariant.Twitter]: 'fab fa-twitter',
        [QuestVariant.Discord]: 'fab fa-discord',
        [QuestVariant.YouTube]: 'fab fa-youtube',
        [QuestVariant.Custom]: 'fas fa-flag',
        [QuestVariant.Web3]: 'fab fa-ethereum',
    };
    isUnpublishedShown = true;

    pools!: IPools;
    quests!: TQuestState;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        if (!this.quests[this.$route.params.id]) return 0;
        return this.quests[this.$route.params.id].total;
    }

    get currentPage() {
        if (!this.quests[this.$route.params.id]) return 1;
        return this.quests[this.$route.params.id].page;
    }

    get allQuests() {
        if (!this.quests[this.$route.params.id]) return [];
        return this.quests[this.$route.params.id].results.map((quest: any) => ({
            index: quest,
            checkbox: quest._id,
            variant: quest.variant,
            points: quest.amount || `${quest.amounts.length} days`,
            title: quest.title,
            entries: quest.entryCount,
            quest: quest,
        }));
    }

    mounted() {
        this.listQuests();
    }

    rowClass(item, type) {
        if (!item || type !== 'row') return;
        if (!item.quest.isPublished) return 'bg-light text-gray';
    }

    async listQuests() {
        this.isLoading = true;
        const query = {
            page: this.page,
            pool: this.pool,
            limit: this.limit,
        };
        if (!this.isUnpublishedShown) {
            query['isPublished'] = true;
        }
        this.$store.dispatch('pools/listQuests', query);
        this.isLoading = false;
    }

    onClickUp({ index }: { index: TBaseReward }, i: number) {
        this.move(
            index,
            i,
            i >= 0 ? i - 1 : 0,
            this.quests[this.$route.params.id].results.find((q) => q.index === i - 1),
        );
    }

    onClickDown({ index }: { index: TBaseReward }, i: number) {
        this.move(
            index,
            i,
            i >= this.allQuests.length - 1 ? this.allQuests.length - 1 : i + 1,
            this.quests[this.$route.params.id].results.find((q) => q.index === i + 1),
        );
    }

    async move(quest: TBaseReward, i: number, newIndex: number, other?: TBaseReward) {
        const promises: any = [];
        const { _id, poolId, variant, page, update } = quest;
        const p = quest.update({
            _id,
            poolId,
            variant,
            page,
            update,
            index: newIndex,
        } as any);
        promises.push(p);

        if (!other) return;
        const p2 = other.update({
            _id: other._id,
            poolId: other.poolId,
            variant: other.variant,
            page: other.page,
            update: other.update,
            index: i,
        } as any);
        promises.push(p2);
        await Promise.all(promises);
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listQuests();
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? this.quests[this.$route.params.id].results : [];
    }

    onChangePage(page: number) {
        this.page = page;
        this.listQuests();
    }

    onClickDelete(quest: TBaseReward) {
        switch (quest.variant) {
            case QuestVariant.Daily:
                return this.$store.dispatch('dailyRewards/delete', quest);
            case QuestVariant.Invite:
                return this.$store.dispatch('referralRewards/delete', quest);
            case QuestVariant.Discord:
            case QuestVariant.YouTube:
            case QuestVariant.Twitter:
                return this.$store.dispatch('pointRewards/delete', quest);
            case QuestVariant.Custom:
                return this.$store.dispatch('milestoneRewards/delete', quest);
            case QuestVariant.Web3:
                return this.$store.dispatch('web3Quests/delete', quest);
        }
        this.listQuests();
    }

    onClickAction(action: { variant: number }) {
        switch (action.variant) {
            case 0: // Delete
                for (const quest of Object.values(this.selectedItems)) {
                    this.onClickDelete(quest);
                }
        }
    }
}
</script>

<style lang="scss">
.btn-sort {
    a {
        line-height: 0;
        display: flex;
        height: 20px;
        width: 40px;
        padding: 0;
        cursor: pointer;
        color: var(--gray);
        justify-content: center;

        &:first-child {
            align-items: end;
        }

        &:hover {
            text-decoration: none;
            color: var(--gray-dark);

            &:active {
                color: var(--gray);
            }
        }
    }
}

#table-quests tr:first-child .btn-sort a:first-child,
#table-quests tr:last-child .btn-sort a:last-child {
    opacity: 0.5;
    cursor: not-allowed;
    color: var(--gray) !important;
}

#table-quests th:nth-child(1) {
    width: 20px;
}
#table-quests th:nth-child(2) {
    width: 40px;
}
#table-quests th:nth-child(3) {
    width: 100px;
}
#table-quests th:nth-child(4) {
    width: 100px;
}
#table-quests th:nth-child(5) {
    width: auto;
}
#table-quests th:nth-child(6) {
    width: 120px;
}
#table-quests th:nth-child(7) {
    width: 40px;
}
</style>
