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
                        <b-form-group label="NFT" v-if="!erc721SelectedMetadataIds.length">
                            <BaseDropdownSelectERC721 :chainId="chainId" :erc721="erc721" @selected="onSelectERC721" />
                        </b-form-group>
                        <b-form-group label="Token Id" v-if="erc721 && hasImportedTokens">
                            <BaseDropdownERC721ImportedToken
                                :erc721Id="erc721._id"
                                :erc721tokenId="erc721tokenId"
                                :erc721Tokens="erc721Tokens"
                                :pool="pool"
                                @selected="onSelectERC721Token"
                            />
                        </b-form-group>
                        <b-form-group
                            label="Metadata"
                            v-if="erc721 && !erc721SelectedMetadataIds.length && !hasImportedTokens"
                        >
                            <BaseDropdownERC721Metadata
                                :erc721="erc721"
                                :erc721metadataId="erc721metadataId"
                                @selected="onSelectMetadata"
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
import { type TPool } from '@thxnetwork/types/index';
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { platformList, platformInteractionList } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform, type TERC721Perk } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseCardCommerce from '../cards/BaseCardCommerce.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import type { IERC721s, IERC721Tokens, TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { mapGetters } from 'vuex';
import BaseDropdownSelectERC721 from '../dropdowns/BaseDropdownSelectERC721.vue';
import BaseDropdownERC721ImportedToken from '../dropdowns/BaseDropdownERC721ImportedToken.vue';
import BaseCardClaimAmount from '../cards/BaseCardClaimAmount.vue';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { TERC721Token } from '@thxnetwork/dashboard/types/erc721';
import BaseCardTokenGating from '../cards/BaseCardTokenGating.vue';
import { TokenGatingVariant } from '@thxnetwork/types/enums/TokenGatingVariant';

type TRewardCondition = {
    platform: RewardConditionPlatform;
    interaction?: RewardConditionInteraction;
    content?: string;
};

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
        erc721s: 'erc721/all',
        profile: 'account/profile',
        erc721Tokens: 'erc721/erc721Tokens',
    }),
})
export default class ModalRewardERC721Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    erc721: TERC721 | null = null;
    erc721Id = '';
    pools!: IPools;
    profile!: IAccount;
    error = '';
    title = '';
    erc721metadataId = '';
    erc721tokenId: string | undefined = undefined;
    description = '';
    expiryDate: Date | null = null;
    claimAmount = 0;
    claimLimit = 0;
    limit = 0;
    pointPrice = 0;
    erc721s!: IERC721s;
    erc721Tokens!: IERC721Tokens;
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
    @Prop({ required: false, default: () => [] }) erc721SelectedMetadataIds!: string[];

    get chainId() {
        return (this.pool && this.pool.chainId) || (this.erc721 && this.erc721.chainId) || ChainId.Hardhat;
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
        this.erc721 = this.perk ? this.erc721s[this.perk.erc721Id] : null;
        this.erc721metadataId = this.perk ? this.perk.erc721metadataId : '';
        this.erc721tokenId = this.perk ? this.perk.erc721tokenId : undefined;
        this.tokenGatingContractAddress = this.perk
            ? this.perk.tokenGatingContractAddress
            : this.tokenGatingContractAddress;
        this.tokenGatingVariant = this.perk ? this.perk.tokenGatingVariant : this.tokenGatingVariant;
        this.tokenGatingAmount = this.perk ? this.perk.tokenGatingAmount : this.tokenGatingAmount;
    }

    get hasImportedTokens() {
        return (
            this.erc721 &&
            this.erc721Tokens &&
            this.erc721Tokens[this.erc721._id] &&
            Object.keys(this.erc721Tokens[this.erc721._id]).length
        );
    }

    async onSelectERC721(erc721: TERC721) {
        if (!erc721) return;
        this.erc721 = erc721;
        await this.$store.dispatch('erc721/listImportedERC721Tokens', {
            erc721Id: this.erc721._id,
            pool: this.pool,
        });
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

    onSelectMetadata(metadata: TERC721Metadata) {
        if (!metadata) return;
        this.erc721metadataId = metadata._id;
    }

    onSelectERC721Token(token: TERC721Token) {
        if (!token) return;
        this.erc721tokenId = token._id;
    }

    onSubmit() {
        // TODO Remove when proper UI validation is implemented
        if (!this.erc721metadataId && !this.erc721SelectedMetadataIds.length) {
            this.error = 'Select the NFT metadata fort this perk';
            return;
        }

        this.isLoading = true;

        const payload = {
            page: 1,
            title: this.title,
            description: this.description,
            erc721metadataIds: JSON.stringify(
                this.erc721metadataId ? [this.erc721metadataId] : this.erc721SelectedMetadataIds,
            ),
            claimAmount: this.claimAmount,
            claimLimit: this.claimLimit,
            limit: this.limit,
            pointPrice: this.pointPrice,
            price: this.price,
            priceCurrency: this.priceCurrency,
            file: this.imageFile,
            isPromoted: this.isPromoted,
            erc721tokenId: this.erc721tokenId,
            tokenGatingContractAddress: this.tokenGatingContractAddress,
            tokenGatingVariant: this.tokenGatingVariant,
            tokenGatingAmount: this.tokenGatingAmount,
        };

        if (this.expiryDate) Object.assign(payload, { expiryDate: this.expiryDate });

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
