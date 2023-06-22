<template>
    <b-modal
        size="xl"
        title="Welcome!👋"
        no-close-on-backdrop
        no-close-on-esc
        centered
        no-fade
        hide-header-close
        :hide-footer="true"
        id="modalRequestAccountEmailUpdate"
    >
        <b-row>
            <b-col md="6">
                <p class="text-muted">
                    Please tell us a bit about yourself. We are preparing your campaign while you fill this in!
                </p>

                <b-form-group label="My email is" v-if="!account.email" :state="isValidEmail">
                    <b-form-input v-model="email" type="email" :state="isValidEmail" />
                </b-form-group>

                <b-form-group label="My role is">
                    <b-form-select v-model="role">
                        <b-form-select-option
                            :value="key"
                            :disabled="key == Roles.None"
                            :key="key"
                            v-for="(label, key) of roleLabelMap"
                        >
                            {{ label }}
                        </b-form-select-option>
                    </b-form-select>
                </b-form-group>

                <b-form-group label="I want to">
                    <b-form-checkbox-group stacked name="goals" v-model="goal" :options="goalLabelMap" />
                </b-form-group>
            </b-col>
            <b-col md="6">
                <b-card bg-variant="darker">
                    <b-alert variant="info" show v-if="deploying">
                        <i class="fas fa-hourglass-half mr-2"></i>
                        Preparing your campaign takes ~20 seconds..
                        <b-progress class="mt-2">
                            <b-progress-bar
                                :animated="progress < 100"
                                :style="`width: ${progress}%`"
                                :variant="progress < 100 ? 'gray' : 'primary'"
                            ></b-progress-bar>
                        </b-progress>
                    </b-alert>

                    <p class="text-muted">
                        Campaign Contracts hold your <strong>Coin</strong> and <strong>NFT Rewards</strong> that are
                        redeemable for points earned with Quests.
                    </p>
                    <hr class="border-dark" />
                    <p class="text-muted font-weight-bold">TO DO:</p>
                    <ul class="text-muted list-unstyled">
                        <li class="my-1">
                            <i class="fas fa-check-circle text-success mr-2"></i>
                            Find <strong>growth hacking tools</strong> for rewarding users
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-success mr-2"></i>
                            Create an <strong>Account</strong> with THX Network
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-muted mr-2"></i>
                            Add the <strong>Widget Script</strong> to your HTML page
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-muted mr-2"></i>
                            Set a <strong>Quest</strong> for your users to earn points
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-muted mr-2"></i>
                            Set a <strong>Reward</strong> for your users to redeem their points
                        </li>
                    </ul>
                </b-card>
            </b-col>
        </b-row>

        <b-button block @click="onClickSubmit" :disabled="isSubmitDisabled" class="rounded-pill mt-3" variant="primary">
            Continue
            <i class="fas fa-chevron-right ml-2"></i>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import type { TAccount } from '@thxnetwork/types/interfaces';
import { Goal, Role } from '@thxnetwork/types/enums';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { goalLabelMap, roleLabelMap } from '@thxnetwork/types/contants';

export function validateEmail(email: string) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
}

@Component({
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class BaseModalRequestAccountEmailUpdate extends Vue {
    Roles = Role;
    Goals = Goal;
    roleLabelMap = roleLabelMap;
    goalLabelMap = goalLabelMap;
    email = '';
    role: Role = Role.None;
    goal: Goal[] = [];
    isLoadingSubmit = false;
    timer: number | unknown;
    progress = 5;

    account!: TAccount;

    @Prop() deploying!: boolean;

    mounted() {
        this.timer = setInterval(() => {
            this.progress += 7 + Math.random() * 10;
            if (this.progress > 100) this.reset();
        }, 2000);
        this.email = this.account.email;
        this.role = this.account.role;
        this.goal = this.account.goal;
    }

    get isSubmitDisabled() {
        return (this.role === Role.None || !this.goal.length) && (this.progress < 100 || !this.deploying);
    }

    get isValidEmail() {
        return !!validateEmail(this.email);
    }

    async onClickSubmit() {
        if (this.isSubmitDisabled || this.isLoadingSubmit) return;
        this.isLoadingSubmit = true;
        await this.$store.dispatch('account/update', { role: this.role, goal: this.goal, email: this.email });
        this.isLoadingSubmit = false;
        this.$bvModal.hide('modalRequestAccountEmailUpdate');
    }

    reset() {
        clearInterval(this.timer as number);
        this.timer = null;
    }

    beforeDestroy() {
        this.reset();
    }
}
</script>
