<template>
    <base-modal size="xl" :title="`Claims for ${reward.title}`" :id="id" :loading="isLoading" @show="onShow">
        <template #modal-body v-if="!isLoading">
            <BCard variant="white" body-class="p-0 shadow-sm">
                <BaseCardTableHeader
                    :page="page"
                    :limit="limit"
                    :pool="pool"
                    :total-rows="totals[pool._id]"
                    :selectedItems="selectedItems"
                    :actions="[{ variant: 0, label: `Approve claims` }]"
                    @click-action="onClickAction"
                    @change-page="onChangePage"
                    @change-limit="onChangeLimit"
                />
                <BTable
                    hover
                    :busy="isLoading"
                    :items="rewardClaimsByPage"
                    responsive="lg"
                    show-empty
                    sort-by="isApproved"
                    :sort-desc="false"
                >
                    <!-- Head formatting -->
                    <template #head(checkbox)>
                        <b-form-checkbox @change="onChecked" />
                    </template>

                    <template #head(email)> Email </template>
                    <template #head(firstName)> First Name </template>
                    <template #head(lastName)> Last Name </template>
                    <template #head(isApproved)> Approved </template>
                    <template #head(id)> &nbsp; </template>

                    <!-- Cell formatting -->
                    <template #cell(checkbox)="{ item }">
                        <b-form-checkbox :value="item.checkbox" v-model="selectedItems" v-if="!item.isApproved" />
                    </template>
                    <template #cell(email)="{ item }">
                        {{ item.email }}
                    </template>
                    <template #cell(firstName)="{ item }">
                        {{ item.firstName }}
                    </template>
                    <template #cell(lastName)="{ item }">
                        {{ item.lastName }}
                    </template>
                    <template #cell(isApproved)="{ item }">
                        <i v-if="item.isApproved" class="fas fa-check-circle" aria-hidden="true"></i>
                        <i v-else>--</i>
                    </template>

                    <template #cell(id)="{ item }">
                        <b-button
                            v-if="!item.isApproved"
                            class="rounded-pill btn-sm"
                            type="submit"
                            form="formRewardPointsCreate"
                            variant="primary"
                            @click="onApproveClick(item)"
                        >
                            Approve
                        </b-button>
                    </template>
                </BTable>
            </BCard>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { mapGetters } from 'vuex';
import BaseModalReferralRewardCreate from '@thxnetwork/dashboard/components/modals/BaseModalReferralRewardCreate.vue';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import BaseBadgeRewardConditionPreview from '@thxnetwork/dashboard/components/badges/BaseBadgeRewardConditionPreview.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import {
    TReferralRewardClaimAccount,
    TRewardClaimState,
} from '@thxnetwork/dashboard/store/modules/referralRewardClaims';

import BaseModal from './BaseModal.vue';
import { type TReferralReward } from '@thxnetwork/types/interfaces/ReferralReward';

@Component({
    components: {
        BaseModal,
        BaseNothingHere,
        BaseModalReferralRewardCreate,
        BaseBadgeRewardConditionPreview,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        totals: 'referralRewardClaims/totals',
        referralRewardClaims: 'referralRewardClaims/all',
    }),
})
export default class ReferralRewardClaimsModal extends Vue {
    isLoading = true;
    limit = 5;
    page = 1;
    selectedItems: string[] = [];

    totals!: { [poolId: string]: number };
    referralRewardClaims!: TRewardClaimState;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop() reward!: TReferralReward;

    get total() {
        return this.totals[this.pool._id];
    }

    get rewardClaimsByPage() {
        if (!this.referralRewardClaims[this.pool._id]) {
            return [];
        }
        return Object.values(this.referralRewardClaims[this.pool._id])
            .filter((claim: TReferralRewardClaimAccount) => claim.page === this.page)
            .sort((a: TReferralRewardClaimAccount, b: TReferralRewardClaimAccount) =>
                a.createdAt < b.createdAt ? 1 : -1,
            )
            .map((c: TReferralRewardClaimAccount) => ({
                checkbox: c._id,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                isApproved: c.isApproved === undefined ? false : c.isApproved,
                id: c._id,
            }))
            .slice(0, this.limit);
    }

    onShow() {
        this.listRewardClaims();
    }

    listRewardClaims() {
        this.isLoading = true;
        this.$store
            .dispatch('referralRewardClaims/list', {
                page: this.page,
                limit: this.limit,
                pool: this.pool,
                reward: this.reward,
            })
            .then(() => {
                this.isLoading = false;
            });
    }

    onChangeLimit(limit: number) {
        this.limit = limit;
        this.listRewardClaims();
    }

    onChecked(checked: boolean) {
        this.selectedItems = checked ? (this.rewardClaimsByPage.map((c) => c.id) as string[]) : [];
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewardClaims();
    }

    async onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                for (const id of Object.values(this.selectedItems)) {
                    await this.approve(this.referralRewardClaims[this.pool._id][id]);
                }
                this.listRewardClaims();
                break;
        }
    }

    async onApproveClick(claim: TReferralRewardClaimAccount) {
        await this.approve(claim);
        this.listRewardClaims();
    }

    async approve(claim: TReferralRewardClaimAccount) {
        if (claim.isApproved) {
            return;
        }
        const data = {
            pool: this.pool,
            reward: this.reward,
            claim,
            payload: { isApproved: true },
        };
        await this.$store.dispatch('referralRewardClaims/update', data);
    }
}
</script>
