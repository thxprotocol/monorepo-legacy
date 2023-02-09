<template>
    <div>
        <b-row class="mb-3">
            <b-col md="9" class="d-flex align-items-center">
                <h2 class="mb-0 mr-2">NFT Perks</h2>
            </b-col>
            <b-col md="3" class="d-flex justify-content-end">
                <b-button v-b-modal="'modalRewardERC721Create'" class="rounded-pill" variant="primary">
                    <i class="fas fa-plus mr-2"></i>
                    <span class="d-none d-md-inline">NFT Perk</span>
                </b-button>
                <BaseModalRewardERC721Create @submit="listRewards" :id="'modalRewardERC721Create'" :pool="pool" />
            </b-col>
        </b-row>
        <BCard variant="white" body-class="p-0 shadow-sm">
            <BaseCardTableHeader
                :page="page"
                :limit="limit"
                :pool="pool"
                :total-rows="totals[pool._id]"
                :selectedItems="selectedItems"
                :actions="[
                    { variant: 0, label: `Delete perks` },
                    { variant: 1, label: 'Download Claim URL\'s' },
                ]"
                @click-action="onClickAction"
                @change-page="onChangePage"
                @change-limit="onChangeLimit"
            />
            <BaseModalRewardClaimsDownload
                id="modalRewardClaimsDownload"
                :pool="pool"
                :selectedItems="selectedItems"
                :rewards="erc721Perks[pool._id]"
            />
            <BTable hover :busy="isLoading" :items="rewardsByPage" responsive="lg" show-empty>
                <!-- Head formatting -->
                <template #head(checkbox)>
                    <b-form-checkbox @change="onSelectAll" />
                </template>
                <template #head(title)> Title </template>
                <template #head(price)> Price </template>
                <template #head(claims)> Claim URL's </template>
                <template #head(erc721)> NFT </template>
                <template #head(erc721metadataId)> Metadata </template>
                <template #head(id)> &nbsp; </template>

                <!-- Cell formatting -->
                <template #cell(checkbox)="{ item }">
                    <b-form-checkbox :value="item.checkbox" v-model="selectedItems" />
                </template>

                <template #cell(price)="{ item }">
                    <strong class="line-height-1 text-primary">{{ item.price.price }} {{ item.price.currency }}</strong>
                    <small class="line-height-1 text-muted"> / {{ item.price.pointPrice }} pts</small>
                </template>
                <template #cell(claims)="{ item }">
                    <b-link v-b-modal="`modalRewardClaimsDownload${item.id}`" v-if="item.claims.length">
                        <b-progress
                            :value="item.claims.filter((c) => c.sub).length"
                            :max="item.claims.length"
                            show-value
                        />
                    </b-link>
                    <BaseModalRewardClaimsDownload
                        :id="`modalRewardClaimsDownload${item.id}`"
                        :pool="pool"
                        :selectedItems="[item.id]"
                        :rewards="erc721Perks[pool._id]"
                    />
                </template>
                <template #cell(erc721)="{ item }">
                    <strong class="text-muted">{{ item.erc721.name }}</strong>
                </template>
                <template #cell(metadata)="{ index, item }">
                    <BaseBadgeMetadataPreview
                        :index="index"
                        :erc721Id="item.metadata.erc721Id"
                        :metadataId="item.metadata.metadataId"
                    />
                </template>
                <template #cell(id)="{ item }">
                    <b-dropdown variant="link" size="sm" right no-caret>
                        <template #button-content>
                            <i class="fas fa-ellipsis-h ml-0 text-muted"></i>
                        </template>
                        <b-dropdown-item v-b-modal="'modalRewardERC721Create' + item.id">Edit</b-dropdown-item>
                        <b-dropdown-item @click="$store.dispatch('erc721Perks/delete', erc721Perks[pool._id][item.id])">
                            Delete
                        </b-dropdown-item>
                    </b-dropdown>
                    <BaseModalRewardERC721Create
                        @submit="listRewards"
                        :id="'modalRewardERC721Create' + item.id"
                        :pool="pool"
                        :reward="erc721Perks[pool._id][item.id]"
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
import BaseModalRewardERC721Create from '@thxnetwork/dashboard/components/modals/BaseModalRewardERC721Create.vue';
import BaseBadgeMetadataPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeMetadataPreview.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import { RewardConditionPlatform, RewardConditionInteraction, TERC721Perk } from '@thxnetwork/types/index';
import { IERC721s, TERC721 } from '@thxnetwork/dashboard/types/erc721';
import BaseModalRewardClaimsDownload from '@thxnetwork/dashboard/components/modals/BaseModalRewardClaimsDownload.vue';
import { parseUnitAmount } from '@thxnetwork/dashboard/utils/price';

@Component({
    components: {
        BaseModalRewardERC721Create,
        BaseBadgeMetadataPreview,
        BaseBadgeRewardConditionPreview,
        BaseModalRewardClaimsDownload,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        pools: 'pools/all',
        totals: 'erc721Perks/totals',
        erc721s: 'erc721/all',
        erc721Perks: 'erc721Perks/all',
    }),
})
export default class ERC721PerksView extends Vue {
    RewardConditionPlatform = RewardConditionPlatform;
    RewardConditionInteraction = RewardConditionInteraction;
    isLoading = true;
    limit = 10;
    page = 1;
    selectedItems: string[] = [];

    pools!: IPools;
    erc721s!: IERC721s;
    totals!: { [poolId: string]: number };
    erc721Perks!: { [poolId: string]: { [id: string]: TERC721Perk & { erc721: TERC721 } } };

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get total() {
        return this.totals[this.$route.params.id];
    }

    get rewardsByPage() {
        if (!this.erc721Perks[this.$route.params.id]) return [];
        return Object.values(this.erc721Perks[this.$route.params.id])
            .filter((reward: TERC721Perk) => reward.page === this.page)
            .sort((a, b) => (a.createdAt && b.createdAt && a.createdAt < b.createdAt ? 1 : -1))
            .map((r: TERC721Perk & { erc721: TERC721 }) => ({
                checkbox: r._id,
                title: r.title,
                price: {
                    pointPrice: r.pointPrice,
                    price: parseUnitAmount(r.price),
                    currency: r.priceCurrency,
                },
                erc721: {
                    name: r.erc721.name,
                    symbol: r.erc721.symbol,
                },
                metadata: {
                    erc721Id: r.erc721Id,
                    metadataId: r.erc721metadataId,
                },
                claims: r.claims,
                // rewardLimit: r.rewardLimit,
                id: r._id,
            }))
            .slice(0, this.limit);
    }

    mounted() {
        this.listRewards();
    }

    async listRewards() {
        this.isLoading = true;
        await this.$store.dispatch('erc721Perks/list', {
            page: this.page,
            limit: this.limit,
            pool: this.pool,
        });
        this.isLoading = false;
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listRewards();
    }

    onSelectAll(isSelectAll: boolean) {
        this.selectedItems = isSelectAll ? (this.rewardsByPage.map((r) => r.id) as string[]) : [];
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewards();
    }

    onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    this.$store.dispatch('erc721Perks/delete', this.erc721Perks[this.pool._id][id]);
                }
                break;
            case 1:
                this.$bvModal.show('modalRewardClaimsDownload');
            case 2:
                this.$bvModal.show('modalRewardClaimsDownload');
                break;
        }
    }
}
</script>
