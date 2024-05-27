<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-reward-limit
        >
            <strong>Limits</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-reward-limit" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <BaseFormGroup
                    label="Supply Limit"
                    tooltip="Set the max of rewards that can be purchased in this campaign."
                >
                    <b-form-input @input="$emit('change-limit-supply', $event)" type="number" :value="limitSupply" />
                </BaseFormGroup>
                <BaseFormGroup
                    label="Limit"
                    tooltip="Set the max of rewards that can be purchased by a single account."
                >
                    <b-form-input @input="$emit('change-limit', $event)" type="number" :value="limit" />
                </BaseFormGroup>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCardRewardLimits extends Vue {
    isVisible = false;

    @Prop() limitSupply!: number;
    @Prop() limit!: number;

    mounted() {
        this.isVisible = this.limit > 0 || this.limitSupply > 0;
    }
}
</script>
