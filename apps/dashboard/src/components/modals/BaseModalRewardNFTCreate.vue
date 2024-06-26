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
        <BaseFormGroup required label="NFT" tooltip="Select the NFT collection that you want to use for this reward.">
            <BaseDropdownSelectERC721 :nft="nft" @selected="onSelectNFT" />
            <template #description>
                You can import your own <b-link :to="`/nft/`">NFT collections</b-link> and use them for rewards.
            </template>
        </BaseFormGroup>
        <BaseFormGroup
            required
            label="Metadata"
            tooltip="Select the metadata that will be used to mint a token for the campaign participant that purchases this reward."
        >
            <BaseDropdownNFTMetadata
                v-if="nft && !tokenId"
                :pool="pool"
                :nft="nft"
                :metadataId="metadataId"
                @selected="onSelectMetadata"
            />
            <span v-else> You have selected a token. </span>
        </BaseFormGroup>
        <BaseFormGroup
            required
            label="Tokens"
            tooltip="Select the token that will be transfered to the wallet of the campaign participant that purchases this reward."
        >
            <BaseDropdownNFTBalance
                v-if="nft && !metadataId"
                :pool="pool"
                :nft="nft"
                :tokenId="tokenId"
                @selected="onSelectToken"
            />
            <span v-else> You have selected metadata. </span>
        </BaseFormGroup>
        <BaseFormGroup
            required
            label="Amount"
            tooltip="Select the amount of ERC1155 tokens that will be transfered or minted to the wallet of the campaign participant that purchases this reward."
            :description="erc1155Balance ? `Balance: ${erc1155Balance}` : null"
            v-if="nft && nft.variant === NFTVariant.ERC1155"
        >
            <b-form-input type="number" :value="erc1155Amount" @input="onChangeERC1155Amount" />
        </BaseFormGroup>
        <template #aside> </template>
    </BaseModalRewardCreate>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { IERC721s, IERC721Tokens, TERC721, TNFTMetadata } from '@thxnetwork/dashboard/types/erc721';
import type { IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { ChainId, NFTVariant, RewardVariant } from '@thxnetwork/common/enums';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModalRewardCreate from './BaseModalRewardCreate.vue';
import BaseDropdownNFTBalance from '../dropdowns/BaseDropdownNFTBalance.vue';
import BaseDropdownNFTMetadata from '../dropdowns/BaseDropdownNFTMetadata.vue';
import BaseDropdownSelectERC721 from '../dropdowns/BaseDropdownSelectERC721.vue';
import BaseDropdownERC721ImportedToken from '../dropdowns/BaseDropdownERC721ImportedToken.vue';

@Component({
    components: {
        BaseModalRewardCreate,
        BaseDropdownSelectERC721,
        BaseDropdownNFTBalance,
        BaseDropdownNFTMetadata,
        BaseDropdownERC721ImportedToken,
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

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TRewardNFT;

    get chainId() {
        return (this.pool && this.pool.chainId) || (this.nft && this.nft.chainId) || ChainId.Hardhat;
    }

    get isValidRedirectUrl() {
        return this.redirectUrl && isValidUrl(this.redirectUrl);
    }

    async onShow() {
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

    async onSubmit(payload: TReward) {
        if (!this.nft || (!this.metadataId && !this.tokenId)) {
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

            await this.$store.dispatch(`pools/${this.reward ? 'update' : 'create'}Reward`, {
                ...this.reward,
                ...payload,
                variant: RewardVariant.NFT,
                erc721Id,
                erc1155Id,
                erc1155Amount: this.erc1155Amount,
                tokenId: this.tokenId,
                metadataId: this.metadataId,
            });
            this.$emit('submit', { isPublished: payload.isPublished });
            this.$bvModal.hide(this.id);
        } catch (error) {
            this.error = (error as Error).toString();
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
