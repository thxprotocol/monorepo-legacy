<template>
    <div>
        <b-row class="mb-3">
            <b-col class="d-flex align-items-center">
                <h2 class="mb-0">Rewards</h2>
            </b-col>
            <b-col class="d-flex justify-content-end">
                <b-dropdown no-caret variant="primary" toggle-class="rounded-pill">
                    <template #button-content>
                        <i class="fas fa-plus mr-2 ml-0"></i>
                        New Reward
                    </template>
                    <b-dropdown-item-button
                        v-for="(variant, key) of Object.keys(RewardVariant).filter((v) => isNaN(Number(v)))"
                        :key="key"
                        v-b-modal="rewardModalComponentMap[RewardVariant[variant]]"
                        button-class="d-flex"
                    >
                        <div style="width: 30px">
                            <i
                                class="text-muted mr-2"
                                :class="rewardIconClassMap[RewardVariant[variant]]"
                                aria-hidden="true"
                            ></i>
                        </div>
                        {{ variant }}
                        <component
                            @submit="onSubmit"
                            :is="rewardModalComponentMap[RewardVariant[variant]]"
                            :id="rewardModalComponentMap[RewardVariant[variant]]"
                            :total="allRewards.length"
                            :pool="pool"
                        />
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
                :selectedItems="[]"
                :actions="[]"
                :published="isPublished"
                @click-published="onClickFilterPublished"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <div class="table-responsive">
                <table
                    id="table-rewards"
                    class="table table-hover"
                    :busy="isLoading"
                    :items="allRewards"
                    responsive="lg"
                    show-empty
                >
                    <thead>
                        <th>&nbsp;</th>
                        <th>
                            <b-form-checkbox :checked="isCheckedAll" @change="onChecked" />
                        </th>
                        <th>Title</th>
                        <th>Point Price</th>
                        <th>Payments</th>
                        <th>Created</th>
                        <th>&nbsp;</th>
                    </thead>
                    <tbody>
                        <tr
                            :class="{
                                'bg-light text-gray': !item.reward.isPublished,
                            }"
                            :items="allRewards"
                            :key="item.reward._id"
                            class="w-100"
                            v-for="item of allRewards"
                        >
                            <td style="padding: 0; vertical-align: top; position: relative">
                                <div
                                    class="bg-light d-flex justify-content-center align-items-center h-100"
                                    style="width: 40px; position: absolute"
                                >
                                    <i :class="rewardIconClassMap[item.reward.variant]" class="text-muted small" />
                                </div>
                            </td>
                            <td>
                                <b-form-checkbox :value="item.reward" v-model="selectedItems" />
                            </td>
                            <td>
                                {{ item.title.label }}
                                <i
                                    v-if="item.title.locks.length"
                                    class="fas fa-lock mx-1 text-muted"
                                    v-b-tooltip
                                    :title="`Locked with ${item.title.locks.length} quest${
                                        item.title.locks.length > 1 ? 's' : ''
                                    }`"
                                />
                                <i
                                    v-if="item.reward.expiryDate"
                                    class="fas fa-clock small ml-1"
                                    :class="{
                                        'text-danger': item.title.expiry.isExpired,
                                        'text-muted': !item.title.expiry.isExpired,
                                    }"
                                    v-b-tooltip
                                    :title="`Expiry: ${item.title.expiry.label}`"
                                />
                            </td>
                            <td>
                                <strong class="text-primary">{{ item.pointPrice }} </strong>
                            </td>
                            <td>
                                <BaseButtonRewardPayments :pool="pool" :reward="item.reward" />
                            </td>
                            <td>
                                <small class="text-muted">{{ item.created }}</small>
                            </td>
                            <td>
                                <b-dropdown variant="link" size="sm" right no-caret>
                                    <template #button-content>
                                        <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                                    </template>
                                    <b-dropdown-item
                                        v-if="item.reward.variant === RewardVariant.NFT && item.reward.erc721Id"
                                        v-b-modal="`modalQRCodes${item.reward._id}`"
                                    >
                                        QR Codes
                                    </b-dropdown-item>
                                    <b-dropdown-item
                                        v-b-modal="rewardModalComponentMap[item.reward.variant] + item.reward._id"
                                    >
                                        Edit
                                    </b-dropdown-item>
                                    <b-dropdown-item v-b-modal="`modalDelete-${item.reward._id}`">
                                        Delete
                                    </b-dropdown-item>
                                    <BaseModalDelete
                                        @submit="onClickDelete(item.reward)"
                                        :id="`modalDelete-${item.reward._id}`"
                                        :subject="item.reward.title"
                                    />
                                </b-dropdown>
                                <BaseModalQRCodes
                                    :id="`modalQRCodes${item.reward._id}`"
                                    :pool="pool"
                                    :reward="item.reward"
                                />
                                <component
                                    @submit="onSubmit"
                                    :key="item.reward._id"
                                    :is="rewardModalComponentMap[item.reward.variant]"
                                    :id="rewardModalComponentMap[item.reward.variant] + item.reward._id"
                                    :pool="pool"
                                    :total="allRewards.length"
                                    :reward="rewards[$route.params.id].results.find((q) => q._id === item.reward._id)"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </BCard>
    </div>
</template>

<script lang="ts">
import { TRewardState } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { RewardVariant } from '@thxnetwork/common/enums';
import { format } from 'date-fns';
import BaseModalRewardCoinCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCoinCreate.vue';
import BaseModalRewardNFTCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardNFTCreate.vue';
import BaseModalRewardCustomCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCustomCreate.vue';
import BaseModalRewardCouponCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCouponCreate.vue';
import BaseModalRewardDiscordRoleCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardDiscordRoleCreate.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModalQRCodes from '@thxnetwork/dashboard/components/modals/BaseModalQRCodes.vue';
import BaseButtonRewardPayments from '@thxnetwork/dashboard/components/buttons/BaseButtonRewardPayments.vue';
import BaseModalDelete from '@thxnetwork/dashboard/components/modals/BaseModalDelete.vue';

@Component({
    components: {
        BaseButtonRewardPayments,
        BaseModalRewardCoinCreate,
        BaseModalRewardNFTCreate,
        BaseModalRewardCustomCreate,
        BaseModalRewardCouponCreate,
        BaseModalRewardDiscordRoleCreate,
        BaseCardTableHeader,
        BaseModalQRCodes,
        BaseModalDelete,
    },
    computed: mapGetters({
        rewards: 'pools/rewards',
        totals: 'erc20Perks/totals',
    }),
})
export default class RewardsView extends Vue {
    actions = [
        { label: 'Publish all', variant: 0 },
        { label: 'Unpublish all', variant: 1 },
        { label: 'Delete all', variant: 2 },
    ];
    isLoading = true;
    isPublished = true;
    limit = 10;
    page = 1;
    isCheckedAll = false;
    selectedItems: TReward[] = [];
    RewardVariant = RewardVariant;
    rewardModalComponentMap = {
        [RewardVariant.Coin]: 'BaseModalRewardCoinCreate',
        [RewardVariant.NFT]: 'BaseModalRewardNFTCreate',
        [RewardVariant.Custom]: 'BaseModalRewardCustomCreate',
        [RewardVariant.Coupon]: 'BaseModalRewardCouponCreate',
        [RewardVariant.DiscordRole]: 'BaseModalRewardDiscordRoleCreate',
    };
    rewardIconClassMap = {
        [RewardVariant.Coin]: 'fas fa-coins',
        [RewardVariant.NFT]: 'fas fa-palette',
        [RewardVariant.Custom]: 'fas fa-gift',
        [RewardVariant.Coupon]: 'fas fa-tags',
        [RewardVariant.DiscordRole]: 'fab fa-discord',
    };
    rewards!: TRewardState;

    @Prop() pool!: TPool;

    get total() {
        if (!this.rewards[this.$route.params.id]) return 0;
        return this.rewards[this.$route.params.id].total;
    }

    get allRewards() {
        if (!this.rewards[this.$route.params.id]) return [];
        return this.rewards[this.$route.params.id].results.map((reward: TBaseReward & { paymentCount: number }) => ({
            checkbox: reward._id,
            title: {
                label: reward.title,
                locks: reward.locks,
                expiry: {
                    isExpired: reward.expiryDate ? Date.now() > new Date(reward.expiryDate).getTime() : false,
                    label: reward.expiryDate ? format(new Date(reward.expiryDate), 'dd-MM-yyyy HH:mm') : '',
                },
            },
            pointPrice: reward.pointPrice,
            payments: reward.paymentCount,
            created: format(new Date(reward.createdAt), 'dd-MM-yyyy HH:mm'),
            reward,
        }));
    }

    mounted() {
        const { isPublished } = this.$route.query as { isPublished?: string };
        this.isPublished = isPublished ? JSON.parse(isPublished) : true;
        this.listRewards();
        this.listQuests();
    }

    async listQuests() {
        await this.$store.dispatch('pools/listQuests', {
            pool: this.pool,
            isPublished: true,
            page: 1,
            limit: 50,
        });
    }

    async listRewards() {
        this.isLoading = true;
        await this.$store.dispatch('pools/listRewards', {
            pool: this.pool,
            page: this.page,
            limit: this.limit,
            isPublished: this.isPublished,
        });
        this.isLoading = false;
    }

    async openPublished(isPublished: boolean) {
        try {
            this.isPublished = isPublished;
            await this.$router.push({
                path: `/campaign/${this.pool._id}/rewards`,
                query: { isPublished: isPublished ? String(isPublished) : 'false' },
            });
        } catch (error) {
            // Suppress error
        } finally {
            await this.listRewards();
        }
    }

    onSubmit(query: { isPublished: boolean }) {
        this.openPublished(query.isPublished);
    }

    onClickFilterPublished(isPublished: boolean) {
        this.openPublished(isPublished);
        this.listRewards();
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? this.rewards[this.$route.params.id].results : [];
        this.isCheckedAll = checked;
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listRewards();
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewards();
    }

    onClickDelete(reward: TReward) {
        reward.delete(reward);
    }
}
</script>
<style lang="scss">
#table-rewards th:nth-child(1) {
    width: 40px;
}
#table-rewards th:nth-child(2) {
    width: 40px;
}
#table-rewards th:nth-child(3) {
    width: auto;
}
#table-rewards th:nth-child(4) {
    width: 130px;
}
#table-rewards th:nth-child(5) {
    width: 130px;
}
#table-rewards th:nth-child(6) {
    width: 150px;
}
#table-rewards th:nth-child(7) {
    width: 40px;
}
</style>
