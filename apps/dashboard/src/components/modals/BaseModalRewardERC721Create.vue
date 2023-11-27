<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="(reward ? 'Update' : 'Create') + ' NFT Reward'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <form v-on:submit.prevent="onSubmit()" id="formRewardPointsCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
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
                            <b-form-input
                                :state="isValidAmount"
                                type="number"
                                :value="erc1155Amount"
                                @input="onChangeERC1155Amount"
                            />
                        </b-form-group>

                        <b-form-group label="Point Price">
                            <b-form-input type="number" :value="pointPrice" @input="onChangePointPrice" />
                        </b-form-group>
                        <b-form-group label="Image">
                            <b-input-group>
                                <template #prepend v-if="image">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="image" height="35" width="auto" />
                                    </div>
                                </template>
                                <b-form-file v-model="imageFile" accept="image/*" @change="onImgChange" />
                            </b-input-group>
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <!-- <BaseCardCommerce
                            v-if="profile && profile.plan === 1"
                            class="mb-3"
                            :pool="pool"
                            :price="price"
                            :price-currency="priceCurrency"
                            @change-price="price = $event"
                            @change-price-currency="priceCurrency = $event"
                        /> -->
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits class="mb-3" :limit="limit" @change-reward-limit="limit = $event" />
                        <BaseCardTokenGating
                            class="mb-3"
                            :pool="pool"
                            :reward="reward"
                            @change-contract-address="tokenGatingContractAddress = $event"
                            @change-amount="tokenGatingAmount = $event"
                            @change-variant="tokenGatingVariant = $event"
                        />
                        <BaseCardClaimAmount
                            :disabled="!!reward"
                            class="mb-3"
                            :claimAmount="claimAmount"
                            :claimLimit="claimLimit"
                            :redirectUrl="redirectUrl"
                            @change-claim-amount="onChangeClaimAmount"
                            @change-redirect-url="onChangeRedirectURL"
                        />
                        <b-form-group>
                            <b-form-checkbox v-model="isPromoted">Promoted</b-form-checkbox>
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardPointsCreate"
                variant="primary"
                block
            >
                {{ (reward ? 'Update' : 'Create') + ' NFT Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { NFTVariant, TERC1155Token, TERC721Token, type TPool } from '@thxnetwork/types/index';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TERC721Perk, TAccount } from '@thxnetwork/types/interfaces';
import type { IERC721s, IERC721Tokens, TERC721, TNFTMetadata } from '@thxnetwork/dashboard/types/erc721';
import type { IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseCardCommerce from '../cards/BaseCardCommerce.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import { mapGetters } from 'vuex';
import BaseDropdownSelectERC721 from '../dropdowns/BaseDropdownSelectERC721.vue';
import BaseDropdownERC721ImportedToken from '../dropdowns/BaseDropdownERC721ImportedToken.vue';
import BaseCardClaimAmount from '../cards/BaseCardClaimAmount.vue';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
import BaseCardTokenGating from '../cards/BaseCardTokenGating.vue';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';

@Component({
    components: {
        BaseModal,
        BaseCardCommerce,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
        BaseDropdownERC721Metadata,
        BaseDropdownSelectERC721,
        BaseDropdownERC721ImportedToken,
        BaseCardClaimAmount,
        BaseCardTokenGating,
    },
    computed: mapGetters({
        pools: 'pools/all',
        profile: 'account/profile',
        erc721s: 'erc721/all',
        erc721Tokens: 'erc721/erc721Tokens',
        erc1155s: 'erc1155/all',
        erc1155Tokens: 'erc1155/erc1155Tokens',
    }),
})
export default class ModalRewardERC721Create extends Vue {
    NFTVariant = NFTVariant;
    isSubmitDisabled = false;
    isLoading = false;
    nft: TERC721 | TERC1155 | null = null;

    erc721s!: IERC721s;
    erc721Tokens!: IERC721Tokens;

    erc1155s!: IERC1155s;
    erc1155Tokens!: IERC721Tokens;

    metadataId = '';
    tokenId = '';
    erc1155Amount = 1;
    erc1155Balance = '';

    pools!: IPools;
    profile!: TAccount;
    error = '';
    title = '';
    description = '';
    expiryDate: Date | null = null;
    claimAmount = 0;
    claimLimit = 0;
    limit = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    isPromoted = false;
    price = 0;
    priceCurrency = 'USD';
    tokenGatingVariant = TokenGatingVariant.ERC721;
    tokenGatingContractAddress = '';
    tokenGatingAmount = 0;
    redirectUrl = '';

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
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.pointPrice = this.reward ? this.reward.pointPrice : 0;
        this.expiryDate = this.reward ? this.reward.expiryDate : null;
        this.limit = this.reward ? this.reward.limit : 0;
        this.claimAmount = this.reward ? this.reward.claimAmount : this.claimAmount;
        this.claimLimit = this.reward ? this.reward.claimLimit : this.claimLimit;
        this.price = this.reward && this.reward.price ? this.reward.price : this.price;
        this.priceCurrency = this.reward ? this.reward.priceCurrency : this.priceCurrency;
        this.image = this.reward ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : false;
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
        this.tokenGatingContractAddress = this.reward
            ? this.reward.tokenGatingContractAddress
            : this.tokenGatingContractAddress;
        this.tokenGatingVariant = this.reward ? this.reward.tokenGatingVariant : this.tokenGatingVariant;
        this.tokenGatingAmount = this.reward ? this.reward.tokenGatingAmount : this.tokenGatingAmount;
        this.redirectUrl = this.reward ? this.reward.redirectUrl : this.redirectUrl;
    }

    async onSelectNFT(nft: TERC721 | TERC1155) {
        this.nft = nft;
        // this.metadataId = '';
        // this.tokenId = '';

        if (nft) {
            await this.$store.dispatch(nft.variant + '/listTokens', this.pool);
        }
    }

    onSelectMetadata(metadata: TNFTMetadata) {
        this.metadataId = metadata ? metadata._id : '';
    }

    onSelectToken(token: TERC721Token | TERC1155Token) {
        this.tokenId = token ? token._id : '';
        this.erc1155Balance = token ? (token.balance as string) : '';
    }

    onChangeRedirectURL(redirectUrl: string) {
        this.redirectUrl = redirectUrl;
    }

    onChangePointPrice(price: number) {
        this.pointPrice = price;
        if (price > 0) this.claimAmount = 0;
    }

    onChangeClaimAmount(amount: number) {
        this.claimAmount = amount;
        if (amount > 0) this.pointPrice = 0;
    }

    onChangeClaimLimit(limit: number) {
        this.claimLimit = limit;
    }

    onChangeERC1155Amount(amount: number) {
        this.erc1155Amount = amount;
    }

    onSubmit() {
        if (!this.nft || (!this.metadataId && !this.selectedMetadataIds.length && !this.tokenId)) {
            this.error = 'Select a token or metadata for this reward.';
            return;
        }

        this.isLoading = true;
        this.isSubmitDisabled = true;

        let erc721Id, erc1155Id;
        switch (this.nft.variant) {
            case NFTVariant.ERC721:
                erc721Id = this.nft._id;
                break;
            case NFTVariant.ERC1155:
                erc1155Id = this.nft._id;
                break;
        }

        const payload = {
            page: 1,
            title: this.title,
            description: this.description,
            file: this.imageFile,
            erc721Id,
            erc1155Id,
            erc1155Amount: this.erc1155Amount,
            tokenId: this.tokenId,
            metadataIds: JSON.stringify(this.metadataId ? [this.metadataId] : this.selectedMetadataIds),
            expiryDate: this.expiryDate ? new Date(this.expiryDate).toISOString() : undefined,
            limit: this.limit,
            pointPrice: this.pointPrice,
            price: this.price,
            priceCurrency: this.priceCurrency,
            isPromoted: this.isPromoted,
            claimAmount: this.claimAmount,
            claimLimit: this.claimLimit,
            tokenGatingContractAddress: this.tokenGatingContractAddress,
            tokenGatingVariant: this.tokenGatingVariant,
            tokenGatingAmount: this.tokenGatingAmount,
            redirectUrl: this.redirectUrl ? this.redirectUrl : undefined,
        };

        this.$store
            .dispatch(`erc721Perks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool || Object.values(this.pools)[0],
                reward: this.reward,
                payload,
            })
            .then(() => {
                this.isSubmitDisabled = false;
                this.isLoading = false;
                this.$bvModal.hide(this.id);
            });
    }

    onImgChange() {
        this.image = '';
    }
}
</script>
