<template>
    <b-card body-class="bg-light p-0">
        <b-button
            class="d-flex align-items-center justify-content-between w-100"
            variant="light"
            v-b-toggle.collapse-card-claim-amount
        >
            <strong>Claim URL's &amp; QR Codes</strong>
            <i :class="`fa-chevron-${isVisible ? 'up' : 'down'}`" class="fas m-0"></i>
        </b-button>
        <b-collapse id="collapse-card-claim-amount" v-model="isVisible">
            <hr class="mt-0" />
            <div class="px-3">
                <b-form-group
                    label="Amount of unique claims"
                    description="We currently support a maximum of 5000 claims per perk. Contact our support if you require more."
                >
                    <b-form-input
                        :disabled="disabled"
                        @input="onInputClaimAmount"
                        type="number"
                        :max="5000"
                        :value="selectedClaimAmount"
                    />
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
    selectedClaimAmount = 0;

    @Prop() claimAmount!: number;
    @Prop() disabled!: boolean;

    mounted() {
        this.selectedClaimAmount = this.claimAmount ? this.claimAmount : this.selectedClaimAmount;
        this.isVisible = this.claimAmount > 0;
    }

    onInputClaimAmount(amount: number) {
        this.selectedClaimAmount = amount;
        this.$emit('change-claim-amount', amount);
    }
}
</script>
