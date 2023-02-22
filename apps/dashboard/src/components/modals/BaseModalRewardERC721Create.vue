<template>
    <base-modal @show="onShow" size="xl" title="Create NFT Perk" :id="id" :error="error" :loading="isLoading">
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
                        <BaseCardRewardLimits
                            class="mb-3"
                            :rewardLimit="rewardLimit"
                            :claimAmount="claimAmount"
                            @change-reward-limit="rewardLimit = $event"
                            @change-claim-amount="onChangeClaimAmount"
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
                {{ reward ? 'Update NFT Perk' : 'Create NFT Perk' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { IPools, type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { platformList, platformInteractionList } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform, type TERC721Perk } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import BaseCardCommerce from '../cards/BaseCardCommerce.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import type { IERC721s, IERC721Tokens, TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { mapGetters } from 'vuex';
import BaseDropdownSelectERC721 from '../dropdowns/BaseDropdownSelectERC721.vue';
import BaseDropdownERC721ImportedToken from '../dropdowns/BaseDropdownERC721ImportedToken.vue';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { TERC721Token } from '../../../../../../wallet/src/store/modules/erc721';

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
        BaseCardRewardQRCodes,
        BaseDropdownERC721Metadata,
        BaseDropdownSelectERC721,
        BaseDropdownERC721ImportedToken,
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
    erc721tokenId = '';
    description = '';
    expiryDate: Date | null = null;
    claimAmount = 0;
    claimLimit = 1;
    rewardLimit = 0;
    pointPrice = 0;
    rewardCondition: TRewardCondition = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    erc721s!: IERC721s;
    erc721Tokens!: IERC721Tokens;
    imageFile: File | null = null;
    image = '';
    isPromoted = false;
    price = 0;
    priceCurrency = 'USD';

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TERC721Perk;
    @Prop({ required: false, default: () => [] }) erc721SelectedMetadataIds!: string[];

    get chainId() {
        return (this.pool && this.pool.chainId) || (this.erc721 && this.erc721.chainId) || ChainId.Hardhat;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.description = this.reward ? this.reward.description : '';
        this.rewardLimit = this.reward ? this.reward.rewardLimit : 0;
        this.pointPrice = this.reward ? this.reward.pointPrice : 0;
        this.expiryDate = this.reward ? this.reward.expiryDate : null;
        this.rewardLimit = this.reward ? this.reward.rewardLimit : 0;
        this.claimAmount = this.reward ? this.reward.claimAmount : 0;
        this.claimLimit = this.reward ? this.reward.claimLimit : 1;
        this.price = this.reward && this.reward.price ? this.reward.price : this.price;
        this.priceCurrency = this.reward ? this.reward.priceCurrency : this.priceCurrency;
        this.rewardCondition = this.reward
            ? {
                  platform: this.reward.platform as RewardConditionPlatform,
                  interaction: this.reward.interaction as RewardConditionInteraction,
                  content: this.reward.content as string,
              }
            : {
                  platform: RewardConditionPlatform.None,
                  interaction: RewardConditionInteraction.None,
                  content: '',
              };
        this.image = this.reward ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : false;

        this.erc721 = this.reward ? this.erc721s[this.reward.erc721Id] : null;
        this.erc721metadataId = this.reward ? this.reward.erc721metadataId : '';
        this.erc721tokenId = this.reward ? this.reward.erc721tokenId : '';
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
        if (!this.erc721metadataId.length) {
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
            rewardLimit: this.rewardLimit,
            pointPrice: this.pointPrice,
            price: this.price,
            priceCurrency: this.priceCurrency,
            file: this.imageFile,
            isPromoted: this.isPromoted,
            platform: this.rewardCondition.platform,
            interaction:
                this.rewardCondition.platform !== RewardConditionPlatform.None
                    ? this.rewardCondition.interaction
                    : RewardConditionInteraction.None,
            content: this.rewardCondition.platform !== RewardConditionPlatform.None ? this.rewardCondition.content : '',
            erc721tokenId: this.erc721tokenId,
        };

        if (this.expiryDate) Object.assign(payload, { expiryDate: this.expiryDate });

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
