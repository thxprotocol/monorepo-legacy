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
                <b-form-group label="Supply Limit" description="Control the supply of this reward with a supply limit.">
                    <b-form-input @input="$emit('change-limit-supply', $event)" type="number" :value="limitSupply" />
                </b-form-group>
                <b-form-group label="Limit" description="Allow for a max amount of purchases per account.">
                    <b-form-input @input="$emit('change-limit', $event)" type="number" :value="limit" />
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

    @Prop() limitSupply!: number;
    @Prop() limit!: number;

    mounted() {
        this.isVisible = this.limit > 0 || this.limitSupply > 0;
    }
}
</script>
