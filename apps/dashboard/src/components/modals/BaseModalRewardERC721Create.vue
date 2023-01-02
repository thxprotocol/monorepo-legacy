<template>
    <base-modal @show="onShow" size="xl" title="Create ERC721 Perk" :id="id" :error="error" :loading="isLoading">
        <template #modal-body v-if="!isLoading">
            <p class="text-gray">ERC721 rewards let your customers claim NFTs for the metadata in your collection.</p>
            <form v-on:submit.prevent="onSubmit()" id="formRewardPointsCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input v-model="title" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea v-model="description" />
                        </b-form-group>
                        <b-form-group label="Metadata" v-if="!erc721SelectedMetadataIds">
                            <BaseDropdownERC721Metadata
                                :erc721metadataId="erc721metadataId"
                                :pool="pool"
                                @selected="onSelectMetadata"
                            />
                        </b-form-group>
                        <b-form-group label="Point Price">
                            <b-form-input type="number" v-model="pointPrice" />
                        </b-form-group>
                        <b-form-group label="Image">
                            <div class="float-left" v-if="image">
                                <img :src="image" width="20%" />
                            </div>
                            <div>
                                <b-form-file v-model="imageFile" accept="image/*" @change="onImgChange" />
                            </div>
                        </b-form-group>
                        <b-form-group label="Is Promoted">
                            <b-form-checkbox v-model="isPromoted" />
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
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { platformList, platformInteractionList } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform, type TERC721Perk } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import type { IERC721s, TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';

@Component({
    components: {
        BaseModal,
        BaseCardRewardCondition,
        BaseCardRewardExpiry,
        BaseCardRewardQRCodes,
        BaseDropdownERC721Metadata,
    },
})
export default class ModalRewardERC721Create extends Vue {
    isSubmitDisabled = false;
    isLoading = false;
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

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TERC721Perk;
    @Prop({ required: false }) erc721SelectedMetadataIds!: string[];

    get erc721(): TERC721 | null {
        if (!this.pool.erc721) return null;
        return this.erc721s[this.pool.erc721._id];
    }

    onShow() {
        if (this.reward) {
            this.erc721metadataId = this.reward.erc721metadataId;
            this.title = this.reward.title;
            this.description = this.reward.description;
            this.rewardLimit = this.reward.rewardLimit;
            this.pointPrice = this.reward.pointPrice;
            this.rewardCondition = {
                platform: this.reward.platform as RewardConditionPlatform,
                interaction: this.reward.interaction as RewardConditionInteraction,
                content: this.reward.content as string,
            };
            if (this.reward.image) {
                this.image = this.reward.image;
            }
            this.isPromoted = this.reward.isPromoted;
        }
    }

    onSelectMetadata(metadata: TERC721Metadata) {
        if (!metadata) return;
        this.erc721metadataId = metadata._id;
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`erc721Perks/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    page: 1,
                    title: this.title,
                    description: this.description,
                    erc721metadataIds: this.erc721metadataId ? [this.erc721metadataId] : this.erc721SelectedMetadataIds,
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
                this.title = '';
                this.erc721metadataId = '';
                this.description = '';
                this.rewardLimit = 0;
                this.claimAmount = 1;
                this.rewardLimit = 0;
                this.rewardCondition = {
                    platform: platformList[0].type,
                    interaction: platformInteractionList[0].type,
                    content: '',
                };
                this.image = '';
                this.$bvModal.hide(this.id);
                this.isSubmitDisabled = false;

                this.error = '';
                this.title = '';
                this.erc721metadataId = '';
                this.description = '';
                this.expiryDate = null;
                this.claimAmount = 1;
                this.rewardLimit = 0;
                this.pointPrice = 0;
                this.rewardCondition = {
                    platform: platformList[0].type,
                    interaction: platformInteractionList[0].type,
                    content: '',
                };
                this.isPromoted = false;
                this.isLoading = false;
            });
    }

    onImgChange() {
        this.image = '';
    }
}
</script>
