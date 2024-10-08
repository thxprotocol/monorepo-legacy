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
        <b-button block variant="link" @click="onClickSignout">Sign out</b-button>
    </b-modal>
</template>

<script lang="ts">
import { Goal, Role } from '@thxnetwork/common/enums';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { goalLabelMap, roleLabelMap } from '@thxnetwork/common/constants';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { validateEmail } from '@thxnetwork/dashboard/utils/email';
import BaseCodeExample from '@thxnetwork/dashboard/components/BaseCodeExample.vue';

@Component({
    components: {
        BaseCodeExample,
    },
    computed: mapGetters({
        account: 'account/profile',
        pools: 'pools/all',
    }),
})
export default class BaseModalOnboarding extends Vue {
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

    pools!: IPools;
    account!: TAccount;

    get pool() {
        const pools = Object.values(this.pools || {});
        if (!pools.length) return;
        return pools[0];
    }

    async mounted() {
        await this.$store.dispatch('pools/list');

        if (!this.account.website || !this.account.email || !this.account.role || !this.account.goal.length) {
            this.$bvModal.show('modalRequestAccountEmailUpdate');
        }

        this.email = this.account.email;
        this.website = this.account.website;
        this.role = this.account.role || Role.None;
        this.goal = this.account.goal;
    }

    get isSubmitDisabled() {
        return !this.isValidWebsite || this.role === Role.None || !this.goal.length || this.isLoadingSubmit;
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
            this.error = response && response.data.error.message;
        } finally {
            this.isLoadingSubmit = false;
        }
    }

    async onClickSignout() {
        await this.$store.dispatch('auth/signOut');
        try {
            await this.$router.push({ name: 'login' });
        } catch (error) {
            // Ignore redundant navigation to current location error
        }
    }
}
</script>
