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
                    <div class="d-flex flex-wrap" style="width: 650px">
                        <b-dropdown-item-button
                            v-for="(variant, key) of Object.keys(QuestVariant).filter((v) => isNaN(Number(v)))"
                            :key="key"
                            v-b-modal="`${questModalComponentMap[QuestVariant[variant]]}-${variant}`"
                            button-class="d-flex px-2"
                            style="flex: 1 0 50%"
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
                                    @submit="onSubmit"
                                    :variant="variant"
                                    :is="questModalComponentMap[QuestVariant[variant]]"
                                    :id="`${questModalComponentMap[QuestVariant[variant]]}-${variant}`"
                                    :total="allQuests.length"
                                    :pool="pool"
                                />
                            </b-media>
                        </b-dropdown-item-button>
                    </div>
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
                    <i
                        v-if="item.quest.locks.length"
                        class="fas fa-lock mx-1 text-muted"
                        v-b-tooltip
                        :title="`Locked with ${item.quest.locks.length} quest${item.quest.locks.length > 1 ? 's' : ''}`"
                    />
                    {{ item.title }}
                </template>
                <template #cell(entries)="{ item }">
                    <BaseButtonQuestEntries
                        v-if="
                            [
                                QuestVariant.Daily,
                                QuestVariant.Invite,
                                QuestVariant.Twitter,
                                QuestVariant.YouTube,
                                QuestVariant.Discord,
                                QuestVariant.Custom,
                                QuestVariant.Web3,
                                QuestVariant.Gitcoin,
                                QuestVariant.Webhook,
                            ].includes(item.quest.variant)
                        "
                        :pool="pool"
                        :quest="item.quest"
                    />
                </template>
                <template #cell(expiry)="{ item }">
                    <small class="text-gray">{{ item.expiry.label }}</small>
                    <i
                        v-if="item.expiry.isExpired"
                        class="fas fa-exclamation-circle small text-danger ml-1"
                        v-b-tooltip
                        title="This quest has expired and is no longer visible in your campaign."
                    />
                </template>
                <template #cell(created)="{ item }">
                    <small class="text-gray">{{ item.created }}</small>
                </template>
                <template #cell(quest)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="questModalComponentMap[item.quest.variant] + item.quest._id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item v-b-modal="`modalDelete-${item.quest._id}`"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <component
                        @submit="onSubmit"
                        :key="item.quest._id"
                        :is="questModalComponentMap[item.quest.variant]"
                        :id="questModalComponentMap[item.quest.variant] + item.quest._id"
                        :pool="pool"
                        :total="allQuests.length"
                        :quest="quests[$route.params.id].results.find((q) => q._id === item.quest._id)"
                    />
                    <BaseModalDelete
                        @submit="onClickDelete(item.quest)"
                        :id="`modalDelete-${item.quest._id}`"
                        :subject="item.quest.title"
                    />
                </template>
            </BTable>
        </BCard>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import { QuestVariant } from '@thxnetwork/common/enums';
import { TQuestState } from '@thxnetwork/dashboard/store/modules/pools';
import { contentQuests } from '@thxnetwork/common/constants';
import BaseModalQuestDailyCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestDailyCreate.vue';
import BaseModalQuestSocialCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestSocialCreate.vue';
import BaseModalQuestInviteCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestInviteCreate.vue';
import BaseModalQuestCustomCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCustomCreate.vue';
import BaseModalQuestWeb3Create from '@thxnetwork/dashboard/components/modals/BaseModalQuestWeb3Create.vue';
import BaseModalQuestInviteClaims from '@thxnetwork/dashboard/components/modals/BaseModalQuestInviteClaims.vue';
import BaseModalQuestGitcoinCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestGitcoinCreate.vue';
import BaseModalQuestWebhookCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestWebhookCreate.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseButtonQuestEntries from '@thxnetwork/dashboard/components/buttons/BaseButtonQuestEntries.vue';
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';

@Component({
    components: {
        BaseCardTableHeader,
        BaseButtonQuestEntries,
        BaseModalQuestDailyCreate,
        BaseModalQuestSocialCreate,
        BaseModalQuestCustomCreate,
        BaseModalQuestWeb3Create,
        BaseModalQuestGitcoinCreate,
        BaseModalQuestInviteCreate,
        BaseModalQuestWebhookCreate,
        BaseModalQuestInviteClaims,
        BaseModalDelete,
    },
    computed: mapGetters({
        quests: 'pools/quests',
    }),
})
export default class QuestsView extends Vue {
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
        [QuestVariant.Gitcoin]: 'BaseModalQuestGitcoinCreate',
        [QuestVariant.Webhook]: 'BaseModalQuestWebhookCreate',
    };
    questIconClassMap = {
        [QuestVariant.Daily]: 'fas fa-calendar',
        [QuestVariant.Invite]: 'fas fa-comments',
        [QuestVariant.Twitter]: 'fab fa-twitter',
        [QuestVariant.Discord]: 'fab fa-discord',
        [QuestVariant.YouTube]: 'fab fa-youtube',
        [QuestVariant.Custom]: 'fas fa-flag',
        [QuestVariant.Web3]: 'fab fa-ethereum',
        [QuestVariant.Gitcoin]: 'fas fa-fingerprint',
        [QuestVariant.Webhook]: 'fas fa-globe',
    };
    isPublished = true;

    quests!: TQuestState;

    @Prop() pool!: TPool;

    get total() {
        if (!this.quests[this.$route.params.id]) return 0;
        return this.quests[this.$route.params.id].total;
    }

    get allQuests() {
        if (!this.quests[this.$route.params.id]) return [];
        return this.quests[this.$route.params.id].results.map((quest: any) => ({
            checkbox: quest._id,
            title: quest.title,
            points: quest.amounts ? `${quest.amounts.length} days` : quest.amount,
            entries: quest.entryCount,
            expiry: {
                isExpired: quest.expiryDate ? Date.now() > new Date(quest.expiryDate).getTime() : false,
                label: quest.expiryDate ? format(new Date(quest.expiryDate), 'dd-MM-yyyy HH:mm') : '',
            },
            created: format(new Date(quest.createdAt), 'dd-MM-yyyy HH:mm'),
            quest,
        }));
    }

    mounted() {
        const { isPublished } = this.$route.query as { isPublished?: string };
        this.isPublished = isPublished ? JSON.parse(isPublished) : true;
        this.listQuests();
    }

    rowClass(item, type) {
        if (!item || type !== 'row') return;
        if (!item.quest.isPublished) return 'bg-light text-gray';
    }

    async listQuests() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listQuests', {
            page: this.page,
            pool: this.pool,
            limit: this.limit,
            isPublished: this.isPublished,
        });
        this.isLoading = false;
    }

    async openPublished(isPublished: boolean) {
        try {
            this.isPublished = isPublished;
            await this.$router.push({
                name: `quests`,
                params: {
                    id: this.pool._id,
                },
                query: { isPublished: isPublished ? String(isPublished) : 'false' },
            });
        } catch (error) {
            // Suppress error
        } finally {
            await this.listQuests();
        }
    }

    onSubmit(query: { isPublished: boolean }) {
        this.openPublished(query.isPublished);
    }

    async onClickFilterPublished(value: boolean) {
        this.openPublished(value);
        await this.listQuests();
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
#table-quests th:nth-child(1) {
    width: 40px;
}
#table-quests th:nth-child(2) {
    width: auto;
}
#table-quests th:nth-child(3) {
    width: 130px;
}
#table-quests th:nth-child(4) {
    width: 130px;
}
#table-quests th:nth-child(5) {
    width: 150px;
}
#table-quests th:nth-child(6) {
    width: 150px;
}
#table-quests th:nth-child(7) {
    width: 40px;
}
</style>