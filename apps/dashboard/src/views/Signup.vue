<template>
    <div
        class="h-100 d-flex align-items-center justify-content-center"
        :style="{
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundImage: `url(${require('@thxnetwork/dashboard/../public/assets/bg.jpg')}) `,
        }"
    >
        <b-container class="m-auto">
            <b-row>
                <b-col md="6">
                    <b-img width="60" :src="require('@thxnetwork/dashboard/../public/assets/logo.png')" fluid />
                    <div>
                        <strong class="my-3 d-block font-weight-normal" :style="{ fontSize: '1.5rem' }">
                            Create your account
                        </strong>
                    </div>
                    <BaseCardLogin :signup="true" :plan="plan" />
                </b-col>
                <b-col md="6" class="d-flex flex-column justify-content-end">
                    <div
                        class="card w-100 mt-2 border-0"
                        style="background: rgba(31, 33, 44, 0.9) !important"
                        v-for="(reason, key) of reasons"
                        :key="key"
                    >
                        <b-link
                            @click="reason.isCollapsed = !reason.isCollapsed"
                            class="text-white d-flex py-1 text-decoration-none p-3"
                        >
                            <div>
                                <i class="fas mr-3 fa-check-circle text-success" />
                                <span>{{ reason.title }}</span>
                            </div>
                            <i class="fas fa-caret-down text-muted ml-auto" />
                        </b-link>
                        <b-collapse v-model="reason.isCollapsed" accordion="my-accordion" class="p-3">
                            {{ reason.description }}
                        </b-collapse>
                    </div>
                </b-col>
            </b-row>
        </b-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import BaseCardLogin from '@thxnetwork/dashboard/components/cards/BaseCardLogin.vue';
import { AccountPlanType } from '@thxnetwork/common/enums';

const reasons = [
    {
        plan: [AccountPlanType.Lite],
        isCollapsed: true,
        title: '€ 89 / month (14 day free trial)',
        description:
            "We invite you to try out all capabilities for 14 days, with no obligation to pay unless you're satisfied!",
    },
    {
        plan: [AccountPlanType.Premium],
        isCollapsed: true,
        title: '€ 449 / month (14 day free trial)',
        description:
            "We invite you to try out all capabilities for 14 days, with no obligation to pay unless you're satisfied!",
    },
    {
        plan: [AccountPlanType.Lite, AccountPlanType.Premium],
        isCollapsed: false,
        title: '70% revenue share',
        description:
            'We reward our community with a 70% share of your fee. This is how we connect token holder incentives with customer success.',
    },
    {
        plan: [AccountPlanType.Lite, AccountPlanType.Premium],
        isCollapsed: false,
        title: 'Custom integrations',
        description:
            'Integrate quest validation with your own app or game. We provide you with various ways to validate quests and reward your users.',
    },
    {
        plan: [AccountPlanType.Lite, AccountPlanType.Premium],
        isCollapsed: false,
        title: 'Discord Bot',
        description:
            'Reach your community in channels that matter most. Post reward overviews and announce new rewards, all automated.',
    },
    {
        plan: [AccountPlanType.Lite, AccountPlanType.Premium],
        isCollapsed: false,
        title: 'Twitter Automation',
        description:
            "You are already very busy managing campaigns... We'll automate your Twitter campaigns, so you can focus on growth!",
    },
    {
        plan: [AccountPlanType.Lite, AccountPlanType.Premium],
        isCollapsed: false,
        title: 'Weekly Performance Reports',
        description:
            'We know budgets and results are important to you. We send you weekly reports by mail and are happy to jump on a call to discuss results and potential improvements.',
    },
];

@Component({
    components: {
        BaseCardLogin,
    },
})
export default class ViewSignup extends Vue {
    plan = AccountPlanType.Lite;
    reasons: { plan: AccountPlanType[]; isCollapsed: boolean; title: string; description: string }[] = [];

    mounted() {
        const signupPlan = this.$route.query.signup_plan as unknown as AccountPlanType;
        if (signupPlan && [AccountPlanType.Lite, AccountPlanType.Premium].includes(Number(signupPlan))) {
            this.plan = Number(signupPlan);
        }
        this.reasons = reasons.filter((reason) => reason.plan.includes(this.plan));
    }
}
</script>
