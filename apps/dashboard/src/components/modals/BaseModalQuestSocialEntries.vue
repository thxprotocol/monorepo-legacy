<template>
    <base-modal
        hide-footer
        size="xl"
        :title="`Quest Entries: ${entriesByPage.length} `"
        :id="id"
        @show="onShow"
        v-if="pool"
    >
        <template #modal-body>
            <BCard variant="white" body-class="p-0 shadow-sm" class="mb-3">
                <BTable hover :items="entriesByPage" responsive="lg" show-empty sort-by="isApproved" :sort-desc="false">
                    <!-- Head formatting -->
                    <template #head(account)> &nbsp;</template>
                    <template #head(connectedAccounts)> Connected </template>
                    <template #head(walletAddress)> Wallet </template>
                    <template #head(pointBalance)> Point Balance </template>
                    <template #head(createdAt)> Created </template>

                    <!-- Cell formatting -->
                    <template #cell(account)="{ item }">
                        <b-media v-b-tooltip :title="`${item.account.id} (${item.account.variant})`">
                            <template #aside>
                                <b-avatar :src="item.account.profileImg" size="sm" variant="light" />
                            </template>
                            {{ item.account.email }}
                        </b-media>
                    </template>
                    <template #cell(connectedAccounts)="{ item }">
                        <span :key="key" v-for="(a, key) in item.connectedAccounts">
                            <b-link v-if="a.url" :href="a.url" target="_blank" class="mr-1">
                                <i :class="a.platform.icon" class="text-gray" v-b-tooltip :title="a.userName" />
                            </b-link>
                            <i v-else :class="a.platform.icon" class="text-gray mr-1" v-b-tooltip :title="a.userId" />
                        </span>
                    </template>
                    <template #cell(wallet)="{ item }">
                        <div class="d-flex align-items-center">
                            <b-img
                                :src="item.wallet.chain.logoUrl"
                                alt=""
                                class="mr-2"
                                v-b-tooltip
                                :title="item.wallet.chain.name"
                                height="12"
                            />
                            <b-link :href="item.wallet.url" target="link">{{ item.wallet.shortAddress }}</b-link>
                        </div>
                    </template>
                    <template #cell(pointBalance)="{ item }">
                        <strong class="text-primary">{{ item.pointBalance }}</strong>
                    </template>
                    <template #cell(createdAt)="{ item }">
                        <small class="text-muted">{{ format(new Date(item.createdAt), 'dd-MM-yyyy HH:mm') }}</small>
                    </template>
                </BTable>
            </BCard>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { AccountVariant, TPointReward, TPointRewardClaim, type TPool } from '@thxnetwork/types/interfaces';
import { mapGetters } from 'vuex';
import { format } from 'date-fns';
import BaseCardTableHeader from '@thxnetwork/dashboard/components/cards/BaseCardTableHeader.vue';
import BaseModal from './BaseModal.vue';
import { getAddressURL, chainInfo } from '../../utils/chains';
import { shortenAddress } from '../../utils/wallet';
import { platformList, tokenKindPlatformMap, platformIconMap } from '@thxnetwork/dashboard/types/rewards';
import { AccessTokenKind, PlatformVariant } from '@thxnetwork/types/enums';

function getUserUrl(a) {
    if (!a || a.kind !== AccessTokenKind.Twitter || !a.metadata) return;
    return `https://www.twitter.com/${a.metadata.username}`;
}

@Component({
    components: {
        BaseModal,
        BaseCardTableHeader,
    },
    computed: mapGetters({
        totals: 'referralRewardClaims/totals',
        referralRewardClaims: 'referralRewardClaims/all',
    }),
})
export default class BaseModalQuestSocialEntries extends Vue {
    getAddressURL = getAddressURL;
    platformList = platformList;
    format = format;
    isLoading = true;
    limit = 5;
    page = 1;
    selectedItems: string[] = [];

    totals!: { [poolId: string]: number };

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop() quest!: TPointReward;

    get total() {
        return this.totals[this.pool._id];
    }

    get entriesByPage() {
        if (!this.quest.entries) return [];
        return Object.values(this.quest.entries)
            .sort((a: TPointRewardClaim, b: TPointRewardClaim) => (a.createdAt < b.createdAt ? 1 : -1))
            .map((entry: any) => ({
                account: {
                    id: entry._id,
                    email: (entry.account && entry.account.email) || 'None',
                    profileImg: entry.account && entry.account.profileImg,
                    twitterUsername: entry.account && entry.account.twitterUsername,
                    variant: entry.account && AccountVariant[entry.account.variant],
                },
                connectedAccounts: entry.account.connectedAccounts
                    .map((a) => {
                        const platformId = tokenKindPlatformMap[a.kind];
                        return (
                            platformId && {
                                platform: {
                                    name: PlatformVariant[platformId],
                                    icon: platformIconMap[platformId],
                                },
                                userName: a.metadata ? a.metadata.username : '',
                                userId: a.userId,
                                url: getUserUrl(a),
                            }
                        );
                    })
                    .filter((a) => a),
                wallet: {
                    address: entry.wallet.address,
                    shortAddress: shortenAddress(entry.wallet.address),
                    url: getAddressURL(entry.wallet.chainId, entry.wallet.address),
                    chain: {
                        name: chainInfo[entry.wallet.chainId].name,
                        logoUrl: chainInfo[entry.wallet.chainId].logo,
                    },
                },
                pointBalance: entry.pointBalance,
                createdAt: entry.createdAt,
            }));
    }

    onShow() {
        // debugger;
    }
}
</script>
