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
                <b-form-group label="Reward Limit">
                    <p class="text-muted">Control the supply of this reward with a purchase limit.</p>
                    <b-form-input
                        @input="$emit('change-reward-limit', $event)"
                        type="number"
                        :value="selectedRewardLimit"
                    />
                </b-form-group>
            </div>
        </b-collapse>
    </b-card>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseCardRewardLimits extends Vue {
    isVisible = false;
    selectedRewardLimit = 0;

    @Prop() limit!: number;

    mounted() {
        this.selectedRewardLimit = this.limit ? this.limit : 0;
        this.isVisible = this.limit > 0;
    }

    onInputRewardLimit(limit: number) {
        this.selectedRewardLimit = limit;
        this.$emit('change-reward-limit', limit);
    }
}
</script>
