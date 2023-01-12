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
                            <BaseDropdownSelectERC721 :chainId="chainId" :erc721="erc721" @selected="erc721 = $event" />
                        </b-form-group>
                        <b-form-group label="Metadata" v-if="erc721 && !erc721SelectedMetadataIds.length">
                            <BaseDropdownERC721Metadata
                                :erc721="erc721"
                                :erc721metadataId="erc721metadataId"
                                @selected="onSelectMetadata"
                            />
                        </b-form-group>
                        <b-form-group label="Point Price">
                            <b-form-input type="number" v-model="pointPrice" />
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
                        <BaseCardRewardCondition
                            class="mb-3"
                            :rewardCondition="rewardCondition"
                            @change="rewardCondition = $event"
                        />
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            :rewardLimit="rewardLimit"
                            @change-date="expiryDate = $event"
                            @change-limit="rewardLimit = $event"
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
                {{ reward ? 'Update Perk' : 'Create Perk' }}
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
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import type { IERC721s, TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';
import { mapGetters } from 'vuex';
import BaseDropdownSelectERC721 from '../dropdowns/BaseDropdownSelectERC721.vue';
import { ChainId } from '@thxnetwork/dashboard/types/enums/ChainId';
import { IAccount } from '@thxnetwork/dashboard/types/account';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardRewardExpiry,
        BaseCardRewardQRCodes,
        BaseDropdownERC721Metadata,
        BaseDropdownSelectERC721,
    },
    computed: mapGetters({
        pools: 'pools/all',
        erc721s: 'erc721/all',
        profile: 'account/profile',
    }),
})
export default class ModalRewardERC721Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
    erc721: TERC721 | null = null;
    erc721Id = '';
    pools!: IPools;
    error = '';
    title = '';
    erc721metadataId = '';
    description = '';
    expiryDate: Date | null = null;
    claimAmount = 1;
    rewardLimit = 0;
    pointPrice = 0;
    rewardCondition: { platform: RewardConditionPlatform; interaction: RewardConditionInteraction; content: string } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    erc721s!: IERC721s;
    imageFile: File | null = null;
    image = '';
    isPromoted = false;
    profile!: IAccount;

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
    }

    onSelectMetadata(metadata: TERC721Metadata) {
        if (!metadata) return;
        this.erc721metadataId = metadata._id;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`erc721Perks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool || Object.values(this.pools)[0],
                reward: this.reward,
                payload: {
                    page: 1,
                    title: this.title,
                    description: this.description,
                    erc721metadataIds: JSON.stringify(
                        this.erc721metadataId ? [this.erc721metadataId] : this.erc721SelectedMetadataIds,
                    ),
                    claimAmount: this.claimAmount,
                    rewardLimit: this.rewardLimit,
                    pointPrice: this.pointPrice,
                    platform: this.rewardCondition.platform,
                    interaction: this.rewardCondition.interaction,
                    content: this.rewardCondition.content,
                    file: this.imageFile,
                    isPromoted: this.isPromoted,
                },
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
