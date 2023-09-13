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

                <b-form-group
                    label="My website is"
                    description="URL of the project you are creating your campaign for"
                    :state="isValidWebsite"
                >
                    <b-input-group prepend="https://">
                        <b-form-input v-model="website" type="url" :state="isValidWebsite" />
                    </b-input-group>
                </b-form-group>

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
                        <strong>Preparing your campaign takes ~20 seconds..</strong>
                        <p>
                            Campaign Contracts hold your <strong>Coin</strong> and <strong>NFT Rewards</strong> that are
                            redeemable for points earned with Quests.
                        </p>
                        <b-progress class="mt-2">
                            <b-progress-bar
                                :animated="progress < 100"
                                :style="`width: ${progress}%`"
                                :variant="progress < 100 ? 'gray' : 'primary'"
                            ></b-progress-bar>
                        </b-progress>
                    </b-alert>

                    <b-alert variant="success" show v-if="pool && pool.widget && !pool.widget.active">
                        <i class="fas fa-check mr-2"></i> <strong>Your campaign has been created!</strong><br />
                        <p>
                            Now please add this script to your website and view your
                            <strong>Quest &amp; Reward</strong> campaign.
                        </p>
                        <BaseCodeExample v-if="pool" :pool="pool" />
                    </b-alert>

                    <hr class="border-dark" />

                    <ul class="text-muted list-unstyled">
                        <li class="my-1">
                            <i class="fas fa-check-circle text-success mr-2"></i>
                            Find <strong>Quest &amp; Campaign</strong> tools
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-success mr-2"></i>
                            Sign up with THX Network
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-muted mr-2"></i>
                            Add <strong>script</strong> to your website
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-muted mr-2"></i>
                            Create a <strong>Quest</strong>
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-muted mr-2"></i>
                            Create a <strong>Reward</strong>
                        </li>
                        <li class="my-1">
                            <i class="fas fa-check-circle text-muted mr-2"></i>
                            Monitor <strong>performance</strong>
                        </li>
                    </ul>
                </b-card>
            </b-col>
        </b-row>

        <b-button block @click="onClickSubmit" :disabled="isSubmitDisabled" class="rounded-pill mt-3" variant="primary">
            <b-spinner small variant="white" v-if="isLoadingSubmit" />
            <template v-else>
                Continue
                <i class="fas fa-chevron-right ml-2"></i>
            </template>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import type { TAccount, TPool } from '@thxnetwork/types/interfaces';
import { Goal, Role } from '@thxnetwork/types/enums';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { goalLabelMap, roleLabelMap } from '@thxnetwork/types/contants';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';

export function validateEmail(email: string) {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
}

@Component({
    components: {
        BaseCodeExample,
    },
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
    website = '';
    role: Role = Role.None;
    goal: Goal[] = [];
    isLoadingSubmit = false;
    timer: number | unknown;
    progress = 5;

    account!: TAccount;

    @Prop() deploying!: boolean;
    @Prop() pool!: TPool;

    mounted() {
        this.timer = setInterval(() => {
            this.progress += 7 + Math.random() * 10;
            if (this.progress > 100) this.reset();
        }, 2000);
        this.email = this.account.email;
        this.website = this.account.website;
        this.role = this.account.role || Role.None;
        this.goal = this.account.goal;
    }

    get isSubmitDisabled() {
        return (
            (!this.isValidWebsite || this.role === Role.None || !this.goal.length || this.isLoadingSubmit) &&
            (this.progress < 100 || !this.deploying)
        );
    }

    get isValidEmail() {
        return !!validateEmail(this.email);
    }

    get isValidWebsite() {
        if (!this.website) return;
        return isValidUrl('https://' + this.website);
    }

    async onClickSubmit() {
        if (this.isSubmitDisabled || this.isLoadingSubmit || !this.isValidWebsite) return;
        this.isLoadingSubmit = true;
        await this.$store.dispatch('account/update', {
            website: 'https://' + this.website,
            role: this.role,
            goal: this.goal,
            email: this.email,
        });
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
