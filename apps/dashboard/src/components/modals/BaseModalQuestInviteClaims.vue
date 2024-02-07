<template>
    <base-modal
        hide-footer
        size="xl"
        :title="`Quest Entries: ${rewardClaimsByPage.length}`"
        :id="id"
        @show="onShow"
        v-if="pool"
    >
        <template #modal-body>
            <BCard variant="white" body-class="p-0 shadow-sm" class="mb-3">
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
                    <template #head(id)>
                        <b-form-checkbox @change="onChecked" />
                    </template>

                    <template #head(email)> E-mail </template>
                    <template #head(firstName)> First name </template>
                    <template #head(lastName)> Last name </template>
                    <template #head(metadata)> Metadata </template>
                    <template #head(createdAt)> Created </template>
                    <template #head(isApproved)> &nbsp; </template>

                    <!-- Cell formatting -->
                    <template #cell(id)="{ item }">
                        <b-form-checkbox :value="item.id" v-model="selectedItems" :disabled="item.isApproved" />
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
                    <template #cell(metadata)="{ item }">
                        <code class="small">{{ item.metadata }}</code>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">{{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}</small>
                    </template>
                    <template #cell(isApproved)="{ item }">
                        <b-button
                            :disabled="item.isApproved"
                            class="rounded-pill"
                            variant="primary"
                            size="sm"
                            @click="onClickApprove([referralRewardClaims[pool._id][item.id]])"
                        >
                            <i :class="item.isApproved ? 'fas' : 'far'" class="fa-check-circle ml-0"></i>
                            <span class="ml-1">{{ item.isApproved ? 'Reward transferred' : 'Approve reward' }}</span>
                        </b-button>
                    </template>
                </BTable>
            </BCard>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TPool } from '@thxnetwork/types/interfaces';
import { mapGetters } from 'vuex';
import BaseNothingHere from '@thxnetwork/dashboard/components/BaseListStateEmpty.vue';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import {
    TReferralRewardClaimAccount,
    TRewardClaimState,
} from '@thxnetwork/dashboard/store/modules/referralRewardClaims';

import BaseModal from './BaseModal.vue';
import { type TReferralReward } from '@thxnetwork/types/interfaces/ReferralReward';
import { format } from 'date-fns';

@Component({
    components: {
        BaseModal,
        BaseNothingHere,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        totals: 'referralRewardClaims/totals',
        referralRewardClaims: 'referralRewardClaims/all',
    }),
})
export default class ReferralRewardClaimsModal extends Vue {
    format = format;
    isLoading = true;
    limit = 5;
    page = 1;
    selectedItems: string[] = [];

    totals!: { [poolId: string]: number };
    referralRewardClaims!: TRewardClaimState;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop() reward!: TReferralReward;

    get total() {
        return this.totals[this.pool._id];
    }

    get rewardClaimsByPage() {
        if (!this.referralRewardClaims[this.pool._id]) return [];
        return Object.values(this.referralRewardClaims[this.pool._id])
            .filter((claim: TReferralRewardClaimAccount) => claim.page === this.page)
            .sort((a: TReferralRewardClaimAccount, b: TReferralRewardClaimAccount) =>
                a.createdAt < b.createdAt ? 1 : -1,
            )
            .map((c: TReferralRewardClaimAccount) => ({
                id: c._id,
                firstName: c.firstName,
                lastName: c.lastName,
                email: c.email,
                metadata: c.metadata,
                createdAt: c.createdAt,
                isApproved: c.isApproved,
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
        this.selectedItems = checked
            ? (this.rewardClaimsByPage.filter((c) => !c.isApproved).map((c) => c.id) as string[])
            : [];
    }

    onChangePage(page: number) {
        this.page = page;
        this.listRewardClaims();
    }

    async onClickAction(action: { variant: number; label: string }) {
        switch (action.variant) {
            case 0:
                const claims = this.selectedItems.map((id) => {
                    return this.referralRewardClaims[this.pool._id][id];
                });
                this.onClickApprove(claims);
                break;
        }
    }

    onClickApprove(claims: TReferralRewardClaimAccount[]) {
        this.$store.dispatch('referralRewardClaims/approveMany', {
            pool: this.pool,
            reward: this.reward,
            claims,
            page: this.page,
        });
        this.selectedItems = this.selectedItems.filter((id) => {
            return !claims.map((c) => c._id).includes(id);
        });
    }
}
</script>
