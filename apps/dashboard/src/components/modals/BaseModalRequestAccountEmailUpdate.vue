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
        <b-alert variant="danger" v-if="error" show>
            <i class="fas fa-exclamation-circle mr-2" />
            {{ error }}
        </b-alert>
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
                <b-card variant="primary" show class="mb-3">
                    <p>Please add this script to load the campaign widget for your users.</p>
                    <BaseCodeExample v-if="pool" :pool="pool" />
                </b-card>

                <b-card>
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
        <b-button block variant="link" to="/signout">Sign out</b-button>
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
    error = '';
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
        try {
            this.isLoadingSubmit = true;
            await this.$store.dispatch('account/update', {
                website: 'https://' + this.website,
                role: this.role,
                goal: this.goal,
                email: this.email,
            });
            this.$bvModal.hide('modalRequestAccountEmailUpdate');
        } catch (error) {
            const { response } = error as any;
            console.log(response.data);
            this.error = response && response.data.error.message;
        } finally {
            this.isLoadingSubmit = false;
        }
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
