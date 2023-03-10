<template>
    <b-modal
        size="lg"
        title="Hi there!"
        no-close-on-backdrop
        no-close-on-esc
        centered
        no-fade
        @hide="onHide"
        :visible="loading"
    >
        <b-alert variant="info" show>
            <i class="fas fa-hourglass-half mr-2"></i>
            We are deploying your first loyalty pool. This will take about <strong>20 seconds.</strong>
        </b-alert>
        <b-progress class="my-4">
            <b-progress-bar
                :animated="progress < 100"
                :style="`width: ${progress}%`"
                :variant="progress < 100 ? 'gray' : 'primary'"
            ></b-progress-bar>
        </b-progress>
        <p class="text-muted">
            Loyalty Pools hold <strong>Coin</strong> and <strong>NFT Perks</strong> that are redeemable for points
            earned with rewards.
        </p>
        <ul class="text-muted list-unstyled">
            <li>
                <i class="fas fa-check-circle text-success mr-1"></i>
                Set a <strong>Referral Reward</strong> for your users to invite others
            </li>
            <li>
                <i class="fas fa-check-circle text-success mr-1"></i>
                Set a <strong>Daily Reward</strong> incentivize frequent return visits
            </li>
            <li>
                <i class="fas fa-check-circle text-success mr-1"></i>
                Set a <strong>Conditional Rewards</strong> to reward engagement in other platforms
            </li>
            <li>
                <i class="fas fa-check-circle text-success mr-1"></i>
                Set a <strong>Milestone Rewards</strong> to incentive custom touchpoints in your customer journey
            </li>
            <li>
                <i class="fas fa-check-circle text-success mr-1"></i> Copy the <strong>widget script</strong> in your
                HTML pages.
            </li>
        </ul>
        <template #modal-footer="{ hide }">
            <b-button @click="hide" variant="primary" block class="rounded-pill" :disabled="progress < 100 && loading">
                Continue
                <i class="fas fa-chevron-right ml-2"></i>
            </b-button>
        </template>
    </b-modal>
</template>

<script lang="ts">
import { IPools } from '@thxnetwork/dashboard/store/modules/pools';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseModalOnboarding extends Vue {
    progress = 5;
    timer: any = null;
    pools!: IPools;

    @Prop() show!: boolean;
    @Prop() loading!: boolean;

    mounted() {
        this.timer = setInterval(() => {
            this.progress += 7 + Math.random() * 10;
            if (this.progress > 100) this.reset();
        }, 2000);
    }

    onHide() {
        this.reset();
        this.$emit('hide');
    }

    reset() {
        clearInterval(this.timer);
        this.timer = null;
    }

    beforeDestroy() {
        this.reset();
    }
}
</script>
