import { IPools, TQuestEntryState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { TQuest } from '@thxnetwork/types/interfaces';
import { QuestVariant } from '@thxnetwork/types/enums';
import { hasPremiumAccess } from '@thxnetwork/common';
import { TQuestState } from '@thxnetwork/dashboard/store/modules/pools';
import { contentQuests } from './Quests.vue';

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
        BaseBadgePopover,
    },
    computed: mapGetters({
        pools: 'pools/all',
        quests: 'pools/quests',
        entries: 'pools/entries',
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
    entries!: TQuestEntryState;

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
        return this.quests[this.$route.params.id].results.map((quest: any) => {
            const entries = this.entries[this.$route.params.id]
                ? this.entries[this.$route.params.id][quest._id] || []
                : [];
            const metadata = quest.contentMetadata ? JSON.parse(quest.contentMetadata) : null;
            return {
                index: quest,
                checkbox: quest._id,
                points: quest.amount || `${quest.amounts.length} days`,
                title: quest.title,
                entries,
                metrics: metadata && {
                    reposts: { count: 1 || metadata.metrics.retweet_count, impact: entries.length },
                    likes: { count: 2 || metadata.metrics.like_count, impact: entries.length },
                },
                quest: quest,
            };
        });
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
