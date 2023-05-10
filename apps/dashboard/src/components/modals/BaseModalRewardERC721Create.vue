<template>
    <base-modal
        @show="onShow"
        size="xl"
        :title="perk ? 'Update NFT Perk' : 'Create NFT Perk'"
        :id="id"
        :error="error"
        :loading="isLoading"
    >
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">NFT perks let your customers claim NFTs from your collection.</p>
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
                        <BaseCardCommerce
                            v-if="profile && profile.plan === 1"
                            class="mb-3"
                            :pool="pool"
                            :price="price"
                            :price-currency="priceCurrency"
                            @change-price="price = $event"
                            @change-price-currency="priceCurrency = $event"
                        />
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits class="mb-3" :limit="limit" @change-reward-limit="limit = $event" />
                        <BaseCardTokenGating
                            class="mb-3"
                            :pool="pool"
                            :perk="perk"
                            @change-contract-address="tokenGatingContractAddress = $event"
                            @change-amount="tokenGatingAmount = $event"
                            @change-variant="tokenGatingVariant = $event"
                        />
                        <BaseCardClaimAmount
                            class="mb-3"
                            :claimAmount="claimAmount"
                            :claimLimit="claimLimit"
                            @change-claim-amount="onChangeClaimAmount"
                            @change-claim-limit="onChangeClaimLimit"
                        />
                        <b-form-group>
                            <b-form-checkbox v-model="isPromoted">Promoted</b-form-checkbox>
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            t {{ tokenId }} m {{ metadataId }}
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formRewardPointsCreate"
                variant="primary"
                block
            >
                {{ perk ? 'Update NFT Perk' : 'Create NFT Perk' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { NFTVariant, TERC1155Token, TERC721Token, type TPool } from '@thxnetwork/types/index';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { type TERC721Perk } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseCardCommerce from '../cards/BaseCardCommerce.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import type { IERC721s, IERC721Tokens, TERC721, TNFTMetadata } from '@thxnetwork/dashboard/types/erc721';
import { mapGetters } from 'vuex';
import BaseDropdownSelectERC721 from '../dropdowns/BaseDropdownSelectERC721.vue';
import BaseDropdownERC721ImportedToken from '../dropdowns/BaseDropdownERC721ImportedToken.vue';
import BaseCardClaimAmount from '../cards/BaseCardClaimAmount.vue';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import BaseCardTokenGating from '../cards/BaseCardTokenGating.vue';
import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';
import { IERC1155s, TERC1155 } from '@thxnetwork/dashboard/types/erc1155';
import { fromWei, toWei } from 'web3-utils';

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
    tokenId: string | null = null;
    erc1155Amount = 1;
    erc1155Balance = '';

    pools!: IPools;
    profile!: IAccount;
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

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) perk!: TERC721Perk;
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

    onShow() {
        this.title = this.perk ? this.perk.title : '';
        this.description = this.perk ? this.perk.description : '';
        this.limit = this.perk ? this.perk.limit : 0;
        this.pointPrice = this.perk ? this.perk.pointPrice : 0;
        this.expiryDate = this.perk ? this.perk.expiryDate : null;
        this.limit = this.perk ? this.perk.limit : 0;
        this.claimAmount = this.perk ? this.perk.claimAmount : this.claimAmount;
        this.claimLimit = this.perk ? this.perk.claimLimit : this.claimLimit;
        this.price = this.perk && this.perk.price ? this.perk.price : this.price;
        this.priceCurrency = this.perk ? this.perk.priceCurrency : this.priceCurrency;
        this.image = this.perk ? this.perk.image : '';
        this.isPromoted = this.perk ? this.perk.isPromoted : false;
        if (this.perk && this.perk.erc721Id) {
            this.nft = this.perk ? this.erc721s[this.perk.erc721Id] : this.nft;
        }
        if (this.perk && this.perk.erc1155Id) {
            this.nft = this.perk ? this.erc1155s[this.perk.erc1155Id] : this.nft;
        }
        this.metadataId = this.perk ? this.perk.metadataId : this.metadataId;
        this.tokenId = this.perk ? this.perk.tokenId : this.tokenId;
        this.erc1155Amount =
            this.perk && this.perk.erc1155Amount
                ? Number(fromWei(this.perk.erc1155Amount, 'ether'))
                : this.erc1155Amount;
        this.tokenGatingContractAddress = this.perk
            ? this.perk.tokenGatingContractAddress
            : this.tokenGatingContractAddress;
        this.tokenGatingVariant = this.perk ? this.perk.tokenGatingVariant : this.tokenGatingVariant;
        this.tokenGatingAmount = this.perk ? this.perk.tokenGatingAmount : this.tokenGatingAmount;
    }

    async onSelectNFT(nft: TERC721 | TERC1155) {
        this.nft = nft;
        this.metadataId = '';
        this.tokenId = '';

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
        // // TODO Remove when proper UI validation is implemented
        if (!this.nft || (!this.metadataId && !this.selectedMetadataIds.length)) {
            this.error = 'Select the NFT metadata fort this perk';
            return;
        }

        this.isLoading = true;

        let erc721Id, erc1155Id, expiryDate;
        switch (this.nft.variant) {
            case NFTVariant.ERC721:
                erc721Id = this.nft._id;
                break;
            case NFTVariant.ERC1155:
                erc1155Id = this.nft._id;
                break;
        }

        if (this.expiryDate) {
            expiryDate = this.expiryDate;
        }

        const payload = {
            page: 1,
            title: this.title,
            description: this.description,
            file: this.imageFile,
            erc721Id,
            erc1155Id,
            erc1155Amount: toWei(String(this.erc1155Amount)),
            metadataIds: JSON.stringify(this.metadataId ? [this.metadataId] : this.selectedMetadataIds),
            tokenId: this.tokenId || undefined,
            expiryDate,
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
        };

        this.$store
            .dispatch(`erc721Perks/${this.perk ? 'update' : 'create'}`, {
                pool: this.pool || Object.values(this.pools)[0],
                reward: this.perk,
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
