<template>
    <BaseModalRewardCreate
        @show="onShow"
        @submit="onSubmit"
        :pool="pool"
        :id="id"
        :reward="reward"
        :error="error"
        :is-loading="isLoading"
    >
        <b-form-group label="NFT" v-if="!selectedMetadataIds.length">
            <BaseDropdownSelectERC721 :chainId="chainId" :nft="nft" @selected="onSelectNFT" />
        </b-form-group>
        <b-form-group label="Metadata" v-if="nft && !selectedMetadataIds.length">
            <BaseDropdownERC721Metadata
                :pool="pool"
                :nft="nft"
                :metadataId="metadataId"
                :tokenId="tokenId"
                @selected="onSelectMetadata"
                @selected-token="onSelectToken"
            />
        </b-form-group>
        <b-form-group
            label="Amount"
            :state="isValidAmount"
            :description="erc1155Balance ? `Balance: ${erc1155Balance}` : null"
            v-if="nft && nft.variant === NFTVariant.ERC1155"
        >
            <b-form-input :state="isValidAmount" type="number" :value="erc1155Amount" @input="onChangeERC1155Amount" />
        </b-form-group>

        <template #aside>
            <BaseCardClaimAmount
                :disabled="!!reward"
                class="mb-3"
                :claimAmount="claimAmount"
                :claimLimit="claimLimit"
                :redirectUrl="redirectUrl"
                @change-claim-amount="claimAmount = $event"
                @change-redirect-url="redirectUrl = $event"
            />
        </template>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TERC1155Token, TERC721Token, TPool, TERC721Perk, TBaseReward } from '@thxnetwork/types/interfaces';
import type { IERC721s, IERC721Tokens, TERC721, TNFTMetadata } from '@thxnetwork/dashboard/types/erc721';
import type { IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { ChainId, NFTVariant } from '@thxnetwork/types/enums';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import BaseDropdownSelectERC721 from '../dropdowns/BaseDropdownSelectERC721.vue';
import BaseDropdownERC721ImportedToken from '../dropdowns/BaseDropdownERC721ImportedToken.vue';
import BaseCardClaimAmount from '../cards/BaseCardClaimAmount.vue';

@Component({
    components: {
        BaseModalRewardCreate,
        BaseDropdownSelectERC721,
        BaseDropdownERC721Metadata,
        BaseDropdownERC721ImportedToken,
        BaseCardClaimAmount,
    },
    computed: mapGetters({
        erc721s: 'erc721/all',
        erc721Tokens: 'erc721/erc721Tokens',
        erc1155s: 'erc1155/all',
        erc1155Tokens: 'erc1155/erc1155Tokens',
    }),
})
export default class ModalRewardNFTCreate extends Vue {
    NFTVariant = NFTVariant;
    isLoading = false;
    error = '';

    nft: TERC721 | TERC1155 | null = null;
    erc721s!: IERC721s;
    erc721Tokens!: IERC721Tokens;
    erc1155s!: IERC1155s;
    erc1155Tokens!: IERC721Tokens;
    metadataId = '';
    tokenId = '';
    erc1155Amount = 1;
    erc1155Balance = '';
    redirectUrl = '';

    claimAmount = 0;
    claimLimit = 0;

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TERC721Perk;
    @Prop({ required: false, default: () => [] }) selectedMetadataIds!: string[];

    get chainId() {
        return (this.pool && this.pool.chainId) || (this.nft && this.nft.chainId) || ChainId.Hardhat;
    }

    get isValidAmount() {
        if (!this.erc1155Balance) return null;
        const amount = Number(this.erc1155Amount);
        const balance = Number(this.erc1155Balance);
        return amount > 0 && amount <= balance;
    }

    get isValidRedirectUrl() {
        return this.redirectUrl && isValidUrl(this.redirectUrl);
    }

    async onShow() {
        this.claimAmount = this.reward ? this.reward.claimAmount : this.claimAmount;
        this.claimLimit = this.reward ? this.reward.claimLimit : this.claimLimit;
        if (this.reward && this.reward.erc721Id) {
            await this.$store.dispatch('erc721/read', this.reward.erc721Id);
            this.nft = this.erc721s[this.reward.erc721Id];
        }
        if (this.reward && this.reward.erc1155Id) {
            await this.$store.dispatch('erc1155/read', this.reward.erc1155Id);
            this.nft = this.erc1155s[this.reward.erc1155Id];
        }
        this.metadataId = this.reward && this.reward.metadataId ? this.reward.metadataId : this.metadataId;
        this.tokenId = this.reward && this.reward.tokenId ? this.reward.tokenId : this.tokenId;
        this.erc1155Amount =
            this.reward && this.reward.erc1155Amount ? Number(this.reward.erc1155Amount) : this.erc1155Amount;
        this.redirectUrl = this.reward ? this.reward.redirectUrl : this.redirectUrl;
    }

    async onSelectNFT(nft: TERC721 | TERC1155) {
        this.nft = nft;

        if (nft) {
            await this.$store.dispatch(nft.variant + '/listTokens', this.pool);
        }
    }

    onSelectMetadata(metadata: TNFTMetadata) {
        this.metadataId = metadata ? metadata._id : '';
    }

    async onSelectToken(token: TERC721Token | TERC1155Token) {
        this.tokenId = token ? token._id : '';

        if (token && (token as any).nft.variant == NFTVariant.ERC1155) {
            const balance = await this.$store.dispatch('erc1155/getBalance', { pool: this.pool, token });
            this.erc1155Balance = balance;
        }
    }

    onChangeERC1155Amount(amount: number) {
        this.erc1155Amount = amount;
    }

    async onSubmit(payload: TBaseReward) {
        if (!this.nft || (!this.metadataId && !this.selectedMetadataIds.length && !this.tokenId)) {
            this.error = 'Select a token or metadata for this reward.';
            return;
        }

        try {
            this.isLoading = true;
            let erc721Id, erc1155Id;
            switch (this.nft.variant) {
                case NFTVariant.ERC721:
                    erc721Id = this.nft._id;
                    break;
                case NFTVariant.ERC1155:
                    erc1155Id = this.nft._id;
                    break;
            }
            await this.$store.dispatch(`erc721Perks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    ...payload,
                    erc721Id,
                    erc1155Id,
                    erc1155Amount: this.erc1155Amount,
                    tokenId: this.tokenId,
                    metadataIds: JSON.stringify(this.metadataId ? [this.metadataId] : this.selectedMetadataIds),
                    claimAmount: this.claimAmount,
                    claimLimit: this.claimLimit,
                    redirectUrl: this.redirectUrl ? this.redirectUrl : undefined,
                },
            });
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>