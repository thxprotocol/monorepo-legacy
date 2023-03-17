<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-limits
        >
            <strong>Limits</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-limits" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <b-form-group label="Reward Limit">
                    <p class="text-muted">Determine the max amount of claims for this perk.</p>
                    <b-form-input
                        @input="$emit('change-reward-limit', $event)"
                        type="number"
                        :value="selectedRewardLimit"
                    />
                </b-form-group>
                <b-form-group
                    label="Claim Amount"
                    description="We currently support a maximum of 1000 claims per perk. Contact our support if you require more."
                >
                    <p class="text-muted">Create unique claims URLs that can only be claimed once.</p>
                    <b-form-input @input="onInputClaimAmount" type="number" :max="1000" :value="selectedClaimAmount" />
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
    watch: {
        claimAmount: 'onInputClaimAmount',
    },
})
export default class BaseCardRewardLimits extends Vue {
    isVisible = false;
    selectedRewardLimit = 0;
    selectedClaimAmount = 0;

    @Prop() limit!: number;
    @Prop() claimAmount!: number;

    mounted() {
        this.selectedRewardLimit = this.limit ? this.limit : 0;
        this.selectedClaimAmount = this.claimAmount ? this.claimAmount : 0;
    }

    onInputRewardLimit(limit: number) {
        this.selectedRewardLimit = limit;
        this.$emit('change-reward-limit', limit);
    }

    onInputClaimAmount(amount: number, watchedValue: number) {
        if (watchedValue && this.selectedClaimAmount > 0) {
            this.isVisible = true;
        }
        this.selectedClaimAmount = amount;
        this.$emit('change-claim-amount', amount);
    }
}
</script>
