<template>
    <BaseModal @show="onShow" size="xl" :title="reward ? 'Update Reward' : 'Create Reward'" :id="id" :error="error">
        <template #modal-body>
            <form v-on:submit.prevent="onSubmit" id="formRewardCreate">
                <b-row>
                    <b-col md="6">
                        <BaseFormGroup
                            required
                            label="Title"
                            tooltip="A short and engaging title for this reward. Shown in the reward shop of your campaign."
                        >
                            <b-form-input v-model="title" />
                        </BaseFormGroup>
                        <BaseFormGroup
                            label="Description"
                            tooltip="Little bit of information about the reward shown in the reward shop of your campaign."
                        >
                            <b-textarea v-model="description" />
                        </BaseFormGroup>
                        <BaseFormGroup
                            label="Image"
                            tooltip="Images make your reward more attractive and increase their value. Shown in the reward shop of the campaign."
                        >
                            <b-input-group>
                                <template #prepend v-if="image">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="image" height="35" width="auto" />
                                    </div>
                                </template>
                                <b-form-file v-model="imageFile" accept="image/*" @change="image = '$event'" />
                            </b-input-group>
                        </BaseFormGroup>
                        <BaseFormGroup
                            required
                            label="Point Price"
                            tooltip="The amount of points a campaign participant needs in order to purchase this reward. Reward can have a point price of 0. They will be marked as free to purchase."
                        >
                            <b-form-input type="number" :value="pointPrice" @input="pointPrice = $event" />
                        </BaseFormGroup>
                        <hr />
                        <slot />
                    </b-col>
                    <b-col md="6">
                        <slot name="aside" />
                        <BaseCardQuestLocks
                            :pool="pool"
                            :locks="reward ? reward.locks : []"
                            @change-locks="locks = $event"
                            class="mb-3"
                        />
                        <BaseCardRewardExpiry
                            class="mb-3"
                            :expiryDate="expiryDate"
                            @change-date="expiryDate = $event"
                        />
                        <BaseCardRewardLimits
                            class="mb-3"
                            :limit="limit"
                            :limit-supply="limitSupply"
                            @change-limit="limit = $event"
                            @change-limit-supply="limitSupply = $event"
                        />
                        <b-form-group class="mb-0">
                            <b-form-checkbox v-model="isPromoted">Promoted</b-form-checkbox>
                        </b-form-group>
                        <b-form-group>
                            <b-form-checkbox v-model="isPublished">Published</b-form-checkbox>
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isLoading"
                class="rounded-pill"
                type="submit"
                form="formRewardCreate"
                variant="primary"
                block
            >
                <b-spinner small v-if="isLoading" />
                <template v-else>
                    {{ reward ? 'Update Reward' : 'Create Reward' }}
                </template>
            </b-button>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseModal from './BaseModal.vue';
import BaseCardRewardExpiry from '../cards/BaseCardRewardExpiry.vue';
import BaseCardRewardLimits from '../cards/BaseCardRewardLimits.vue';
import BaseCardQuestLocks from '../cards/BaseCardQuestLocks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardQuestLocks,
        BaseCardRewardExpiry,
        BaseCardRewardLimits,
    },
})
export default class ModalRewardERC20Create extends Vue {
    title = '';
    description = '';
    expiryDate: Date | string = '';
    limit = 0;
    limitSupply = 0;
    pointPrice = 0;
    imageFile: File | null = null;
    image = '';
    isPromoted = false;
    isPublished = false;
    locks: TQuestLock[] = [];

    @Prop() id!: string;
    @Prop() error!: string;
    @Prop() isLoading!: boolean;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TReward;

    onShow() {
        this.title = this.reward ? this.reward.title : this.title;
        this.description = this.reward ? this.reward.description : this.description;
        this.pointPrice = this.reward ? this.reward.pointPrice : this.pointPrice;
        this.expiryDate = this.reward ? this.reward.expiryDate : this.expiryDate;
        this.limit = this.reward ? this.reward.limit : this.limit;
        this.limitSupply = this.reward ? this.reward.limitSupply : this.limitSupply;
        this.image = this.reward && this.reward.image ? this.reward.image : '';
        this.isPromoted = this.reward ? this.reward.isPromoted : this.isPromoted;
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.locks = this.reward ? this.reward.locks : this.locks;
        this.$emit('show');
    }

    onSubmit() {
        this.$emit('submit', {
            poolId: String(this.pool._id),
            title: this.title,
            description: this.description,
            pointPrice: this.pointPrice,
            expiryDate: this.expiryDate,
            limit: this.limit,
            limitSupply: this.limitSupply,
            file: this.imageFile,
            locks: this.locks,
            isPromoted: this.isPromoted,
            isPublished: this.isPublished,
        });
    }
}
</script>
