<template>
    <base-modal size="xl" title="Create ERC721 Reward" :id="id" :error="error" :loading="isLoading">
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
                        <b-form-group label="Metadata">
                            <BaseDropdownERC721Metadata
                                :erc721metadataId="erc721metadataId"
                                :pool="pool"
                                @selected="onSelectMetadata"
                            />
                        </b-form-group>
                    </b-col>
                    <b-col md="6">
                        <BaseCardRewardCondition
                            class="mb-3"
                            :rewardCondition="rewardCondition"
                            @change="rewardCondition = $event"
                        />
                        <BaseCardRewardExpiry class="mb-3" :expiry="rewardExpiry" @change="rewardExpiry = $event" />
                        <!-- <BaseCardRewardQRCodes class="mb-3" @change="rewardExpiry = $event" /> -->
                        <b-form-checkbox class="mb-0" v-model="isClaimOnce">
                            <strong> Claim once </strong>
                            <p>Only allow one claim per account.</p>
                        </b-form-checkbox>
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
                {{ reward ? 'Update Reward' : 'Create Reward' }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { type IPool } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { platformList, platformInteractionList } from '@thxnetwork/dashboard/types/rewards';
import { RewardConditionInteraction, RewardConditionPlatform, TERC721Reward } from '@thxnetwork/types/index';
import BaseModal from './BaseModal.vue';
import BaseCardRewardCondition from '../cards/BaseCardRewardCondition.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardQRCodes from '../cards/BaseCardRewardQRCodes.vue';
import BaseDropdownERC721Metadata from '../dropdowns/BaseDropdownERC721Metadata.vue';
import { IERC721s, TERC721, TERC721Metadata } from '@thxnetwork/dashboard/types/erc721';

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
    isClaimOnce = true;
    rewardExpiry = {};
    claimAmount = 1;
    rewardLimit = 0;
    rewardCondition: { platform: RewardConditionPlatform; interaction: RewardConditionInteraction; content: string } = {
        platform: platformList[0].type,
        interaction: platformInteractionList[0].type,
        content: '',
    };
    erc721s!: IERC721s;

    @Prop() id!: string;
    @Prop() pool!: IPool;
    @Prop({ required: false }) reward!: TERC721Reward;
    @Prop() erc721metadata!: TERC721Metadata[];

    get erc721(): TERC721 | null {
        if (!this.pool.erc721) return null;
        return this.erc721s[this.pool.erc721._id];
    }

    mounted() {
        if (this.reward) {
            this.erc721metadataId = this.reward.erc721metadataId;
            this.title = this.reward.title;
            this.description = this.reward.description;
            this.rewardCondition = {
                platform: this.reward.platform as RewardConditionPlatform,
                interaction: this.reward.interaction as RewardConditionInteraction,
                content: this.reward.content as string,
            };
            this.isClaimOnce = this.reward.isClaimOnce;
        }
    }

    onSelectMetadata(metadata: TERC721Metadata) {
        if (!metadata) return;
        this.erc721metadataId = metadata._id;
    }

    onSubmit() {
        this.isLoading = true;
        debugger;
        this.$store
            .dispatch(`erc721Rewards/${this.reward ? 'update' : 'create'}`, {
                pool: this.pool,
                reward: this.reward,
                payload: {
                    title: this.title,
                    description: this.description,
                    erc721metadataId: this.erc721metadataId,
                    isClaimOnce: this.isClaimOnce,
                    claimAmount: this.claimAmount,
                    rewardLimit: this.rewardLimit,
                    platform: this.rewardCondition.platform,
                    interaction: this.rewardCondition.interaction,
                    content: this.rewardCondition.content,
                },
            })
            .then(() => {
                this.$emit('submit');
                this.$bvModal.hide(this.id);
                this.isLoading = false;
            });
    }
}
</script>
