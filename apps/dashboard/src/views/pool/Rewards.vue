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
                            @submit="listRewards"
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
                :total-rows="totals[pool._id]"
                :selectedItems="[]"
                :actions="[]"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BTable id="table-rewards" hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(pointPrice)> Point Price </template>
                <template #head(title)> Title </template>
                <template #head(supply)> Supply </template>
                <template #head(expiry)> Expiry </template>
                <template #head(reward)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(pointPrice)="{ item }">
                    <strong class="text-primary">{{ item.pointPrice }} </strong>
                </template>
                <template #cell(amount)="{ item }">
                    <strong class="text-primary">{{ item.amount.amount }} {{ item.amount.symbol }}</strong>
                </template>
                <template #cell(supply)="{ item }">
                    {{
                        item.supply.limit
                            ? `${item.supply.progress}/${item.supply.limit}`
                            : String(item.supply.progress) + '/&infin;'
                    }}
                </template>
                <template #cell(title)="{ item }">
                    <b-badge variant="light" class="p-2 mr-2">
                        <i :class="rewardIconClassMap[item.reward.variant]" class="text-muted" />
                    </b-badge>
                    {{ item.title }}
                </template>
                <template #cell(expiry)="{ item }">
                    <small class="text-gray">{{ item.expiry }}</small>
                </template>
                <template #cell(created)="{ item }">
                    <small class="text-gray">{{ item.created }}</small>
                </template>
                <template #cell(reward)="{ item }">
                    <b-dropdown variant="link" size="sm" no-caret right>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item
                            v-if="item.reward.variant === RewardVariant.NFT"
                            v-b-modal="`modalQRCodes${item.reward._id}`"
                        >
                            QR Codes
                        </b-dropdown-item>
                        <b-dropdown-item v-b-modal="rewardModalComponentMap[item.reward.variant] + item.reward._id">
                            Edit
                        </b-dropdown-item>
                        <b-dropdown-item @click="onClickDelete(item.reward)"> Delete </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalQRCodes
                        :id="`modalQRCodes${item.reward._id}`"
                        :pool="pool"
                        :selectedItems="[item.reward._id]"
                        :rewards="allRewards.filter((r) => r.variant == RewardVariant.NFT)"
                    />
                    <component
                        @submit="listRewards"
                        :is="rewardModalComponentMap[item.reward.variant]"
                        :id="rewardModalComponentMap[item.reward.variant] + item.reward._id"
                        :reward="allRewards.find((q) => q._id === item.reward._id)"
                        :pool="pool"
                        :total="allRewards.length"
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
import { TERC20PerkState } from '@thxnetwork/dashboard/store/modules/erc20Perks';
import { TERC721RewardState } from '@thxnetwork/dashboard/store/modules/erc721Perks';
import {
    QuestSocialRequirement,
    TERC20Perk,
    RewardVariant,
    TERC721Perk,
    TCustomReward,
    TBaseReward,
    AccessTokenKind,
} from '@thxnetwork/types/index';
import type { IERC721s } from '@thxnetwork/dashboard/types/erc721';
import BaseModalRewardERC20Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC20Create.vue';
import BaseModalRewardERC721Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC721Create.vue';
import BaseModalRewardCustomCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCustomCreate.vue';
import BaseModalRewardCouponCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardCouponCreate.vue';
import BaseModalRewardDiscordRoleCreate from '@thxnetwork/dashboard/components/modals/BaseModalRewardDiscordRoleCreate.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModalQRCodes from '@thxnetwork/dashboard/components/modals/BaseModalQRCodes.vue';
import { hasPremiumAccess } from '@thxnetwork/common';
import { type TCouponRewardState } from '@thxnetwork/dashboard/store/modules/couponRewards';
import { type TCustomRewardState } from '@thxnetwork/dashboard/store/modules/rewards';
import { format } from 'date-fns';
import { TDiscordRoleRewardState } from '@thxnetwork/dashboard/store/modules/discordRoleRewards';

export const contentRewards = {
    'coin-reward': {
        tag: 'Coin Reward',
        title: 'Cashbacks with Coins',
        description: 'Import your own ERC20 smart contract and let users redeem points for coins.',
        list: ['Provide tangible value', 'Boost user retention', 'Incentivize spending'],
        docsUrl: 'https://docs.thx.network/rewards/coins',
        icon: 'fas fa-coins', // Suggested icon for coins
        color: '#FFD700', // Suggested color for coins (Gold)
    },
    'nft-reward': {
        tag: 'NFT Reward',
        title: 'Exclusive NFTs',
        description: 'Import your own ERC721 or ERC1155 smart contract and let users redeem points for exclusive NFTs.',
        list: ['Offer unique collectibles', 'Enhance user engagement', 'Drive interest in NFTs'],
        docsUrl: 'https://docs.thx.network/rewards/nft',
        icon: 'fas fa-gem', // Suggested icon for gems or precious items
        color: '#9370DB', // Suggested color for NFTs (Light Purple)
    },
    'custom-reward': {
        tag: 'Custom Reward',
        title: 'Flexible Rewards',
        description: 'Use inbound webhooks to reward users with custom features in your application.',
        list: ['Tailor rewards to user needs', 'Enhance user satisfaction', 'Drive app adoption'],
        docsUrl: 'https://docs.thx.network/rewards',
        icon: 'fas fa-cogs', // Suggested icon for customization or settings
        color: '#808080', // Suggested color for customization (Gray)
    },
    'discord-role-reward': {
        tag: 'Discord Role Reward',
        title: 'Exclusive Discord Roles',
        description:
            'Grant users the ability to redeem points for exclusive Discord roles within your community server.',
        list: ['Promote community status', 'Encourage active participation', 'Facilitate social interaction'],
        docsUrl: 'https://docs.thx.network/rewards/discord-role',
        icon: 'fab fa-discord', // Suggested icon for shield or protection
        color: '#7289DA', // Suggested color for Discord roles (Discord Blue)
    },
    'qr-codes': {
        tag: 'QR Codes',
        title: 'Offline Reward Distribution',
        description: 'Use QR codes to distribute rewards in offline environments.',
        list: ['Expand reach to offline users', 'Facilitate in-person engagement', 'Enhance brand recognition'],
        docsUrl: 'https://docs.thx.network',
        icon: 'fas fa-qrcode', // Suggested icon for QR codes
        color: '#000000', // Suggested color for QR codes (Black)
    },
};

@Component({
    components: {
        BaseModalRewardERC20Create,
        BaseModalRewardERC721Create,
        BaseModalRewardCustomCreate,
        BaseModalRewardCouponCreate,
        BaseModalRewardDiscordRoleCreate,
        BaseCardTableHeader,
        BaseModalQRCodes,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'erc20Perks/totals',
        coinRewards: 'erc20Perks/all',
        nftRewards: 'erc721Perks/all',
        customRewards: 'rewards/all',
        couponRewards: 'couponRewards/all',
        discordRoleRewards: 'discordRoleRewards/all',
    }),
})
export default class RewardsView extends Vue {
    AccessTokenKind = AccessTokenKind;
    QuestSocialRequirement = QuestSocialRequirement;
    hasPremiumAccess = hasPremiumAccess;
    isLoading = true;
    limit = 10;
    page = 1;
    selectedItems: string[] = [];
    RewardVariant = RewardVariant;
    rewardModalComponentMap = {
        [RewardVariant.Coin]: 'BaseModalRewardERC20Create',
        [RewardVariant.NFT]: 'BaseModalRewardERC721Create',
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

    pools!: IPools;
    totals!: { [poolId: string]: number };

    coinRewards!: TERC20PerkState;
    nftRewards!: TERC721RewardState;
    customRewards!: TCustomRewardState;
    couponRewards!: TCouponRewardState;
    discordRoleRewards!: TDiscordRoleRewardState;

    erc721s!: IERC721s;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get allRewards() {
        return [
            ...(this.coinRewards[this.$route.params.id] ? Object.values(this.coinRewards[this.$route.params.id]) : []),
            ...(this.nftRewards[this.$route.params.id] ? Object.values(this.nftRewards[this.$route.params.id]) : []),
            ...(this.couponRewards[this.$route.params.id]
                ? Object.values(this.couponRewards[this.$route.params.id])
                : []),
            ...(this.customRewards[this.$route.params.id]
                ? Object.values(this.customRewards[this.$route.params.id])
                : []),
            ...(this.discordRoleRewards[this.$route.params.id]
                ? Object.values(this.discordRoleRewards[this.$route.params.id])
                : []),
        ];
    }

    get rewardsByPage() {
        return this.allRewards
            .filter((reward: TERC20Perk | TERC721Perk | TCustomReward | any) => reward.page === this.page)
            .sort((a: any, b: any) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: any) => ({
                title: r.title,
                pointPrice: r.pointPrice,
                supply: { progress: r.payments ? r.payments.length : 0, limit: r.limit },
                expiry: r.expiryDate ? format(new Date(r.expiryDate), 'dd-MM-yyyy HH:mm') : 'Never',
                created: format(new Date(r.createdAt), 'dd-MM-yyyy HH:mm'),
                reward: r,
            }))
            .slice(0, this.limit);
    }

    mounted() {
        this.listRewards();
    }

    async listRewards() {
        this.isLoading = true;
        // Call new API endpoint that returns all reward including the variant enum
        await Promise.all([
            this.$store.dispatch('erc20Perks/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('erc721Perks/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('rewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('couponRewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
            this.$store.dispatch('discordRoleRewards/list', { page: this.page, pool: this.pool, limit: this.limit }),
        ]);
        this.isLoading = false;
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listRewards();
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? (this.rewardsByPage.map((r) => r.id) as string[]) : [];
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewards();
    }

    onClickDelete(reward: TBaseReward) {
        switch (reward.variant) {
            case RewardVariant.Coin:
                return this.$store.dispatch('erc20Perks/delete', this.coinRewards[this.pool._id][reward._id]);
            case RewardVariant.NFT:
                return this.$store.dispatch('erc721Perks/delete', this.nftRewards[this.pool._id][reward._id]);
            case RewardVariant.Custom:
                return this.$store.dispatch('rewards/delete', this.customRewards[this.pool._id][reward._id]);
            case RewardVariant.Coupon:
                return this.$store.dispatch('couponRewards/delete', this.couponRewards[this.pool._id][reward._id]);
            case RewardVariant.DiscordRole:
                return this.$store.dispatch(
                    'discordRoleRewards/delete',
                    this.discordRoleRewards[this.pool._id][reward._id],
                );
        }
    }
}
</script>
<style lang="scss">
#table-rewards th:nth-child(1) {
    width: auto;
}
#table-rewards th:nth-child(2) {
    width: 130px;
}
#table-rewards th:nth-child(3) {
    width: 150px;
}
#table-rewards th:nth-child(4) {
    width: 150px;
}
#table-rewards th:nth-child(5) {
    width: 150px;
}
#table-rewards th:nth-child(6) {
    width: 100px;
}
</style>
