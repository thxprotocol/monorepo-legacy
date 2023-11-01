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
                :published="isPublished"
                @click-published="onClickFilterPublished"
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
                    <b-form-checkbox :checked="isCheckedAll" @change="onChecked" />
                </template>
                <template #head(title)> Title </template>
                <template #head(points)> Points </template>
                <template #head(entries)> Entries </template>
                <template #head(quest)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(index)="{ item, index }">
                    <div class="btn btn-sort p-0">
                        <b-link block @click="onClickUp(item.quest, index)">
                            <i class="fas fa-caret-up ml-0"></i>
                        </b-link>
                        <b-link block @click="onClickDown(item.quest, index)">
                            <i class="fas fa-caret-down ml-0"></i>
                        </b-link>
                    </div>
                </template>
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.quest" v-model="selectedItems" />
                </template>
                <template #cell(points)="{ item }">
                    <strong class="text-primary">{{ item.points }} </strong>
                </template>
                <template #cell(title)="{ item }">
                    <b-badge variant="light" class="p-2 mr-2">
                        <i :class="questIconClassMap[item.quest.variant]" class="text-muted" />
                    </b-badge>
                    {{ item.title }}
                </template>
                <template #cell(entries)="{ item }">
                    <template v-if="item.quest.variant === QuestVariant.Invite">
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
                        v-if="
                            [QuestVariant.Twitter, QuestVariant.YouTube, QuestVariant.Discord].includes(
                                item.quest.variant,
                            )
                        "
                        :pool="pool"
                        :quest="item.quest"
                    />
                </template>
                <template #cell(quest)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="questModalComponentMap[item.quest.variant] + item.quest._id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item @click="onClickDelete(item.quest)"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <component
                        @submit="listQuests"
                        :is="questModalComponentMap[item.quest.variant]"
                        :id="questModalComponentMap[item.quest.variant] + item.quest._id"
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
import { TQuest } from '@thxnetwork/types/interfaces';
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
    actions = [
        { label: 'Publish all', variant: 0 },
        { label: 'Unpublish all', variant: 1 },
        { label: 'Delete all', variant: 2 },
    ];
    isLoading = true;
    limit = 25;
    page = 1;
    isCheckedAll = false;
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
    isPublished = true;

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
            title: quest.title,
            points: quest.amount || `${quest.amounts.length} days`,
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
            isPublished: this.isPublished,
        };
        await this.$store.dispatch('pools/listQuests', query);
        this.isLoading = false;
    }

    onClickUp(quest: TQuest, i: number) {
        const min = 0;
        const targetIndex = i - 1;
        const newIndex = targetIndex < min ? min : targetIndex;
        const otherQuest = this.quests[this.$route.params.id].results[newIndex];

        this.move(quest, i, newIndex, otherQuest);
    }

    onClickDown(quest: TQuest, i: number) {
        const maxIndex = this.allQuests.length - 1;
        const targetIndex = i + 1;
        const newIndex = targetIndex > maxIndex ? maxIndex : targetIndex;
        const otherQuest = this.quests[this.$route.params.id].results[newIndex];

        this.move(quest, i, newIndex, otherQuest);
    }

    async move(quest: TQuest, currentIndex: number, newIndex: number, other: TQuest) {
        const p = [quest.update({ ...quest, index: newIndex })];
        if (other) p.push(other.update({ ...other, index: currentIndex }));
        await Promise.all(p);
        this.listQuests();
    }

    onClickFilterPublished(value: boolean) {
        this.isPublished = value;
        this.listQuests();
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listQuests();
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? this.quests[this.$route.params.id].results : [];
        this.isCheckedAll = checked;
    }

    onChangePage(page: number) {
        this.page = page;
        this.listQuests();
    }

    onClickDelete(quest: TQuest) {
        quest.delete(quest);
    }

    async onClickAction(action: { variant: number }) {
        // 1. Publish, 2. Unpublish, 3. Delete
        const mappers = {
            0: (quest) => quest.update({ ...quest, isPublished: true }),
            1: (quest) => quest.update({ ...quest, isPublished: false }),
            2: (quest) => quest.delete(quest),
        };
        await Promise.all(this.selectedItems.map(mappers[action.variant]));
        this.isCheckedAll = false;
        this.selectedItems = [];
        this.listQuests();
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
    width: auto;
}
#table-quests th:nth-child(4) {
    width: 130px;
}
#table-quests th:nth-child(5) {
    width: 130px;
}
#table-quests th:nth-child(6) {
    width: 40px;
}
</style>
