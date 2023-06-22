<template>
    <b-modal
        size="lg"
        title="Welcome!👋 Please tell us a bit about yourself."
        no-close-on-backdrop
        no-close-on-esc
        centered
        no-fade
        hide-header-close
        :hide-footer="true"
        id="modalRequestAccountEmailUpdate"
    >
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
        {{ account }}
        <b-button block @click="onClickSubmit" :disabled="isSubmitDisabled" class="rounded-pill mt-3" variant="primary">
            Continue
            <i class="fas fa-chevron-right ml-2"></i>
        </b-button>
    </b-modal>
</template>

<script lang="ts">
import { IAccount } from '@thxnetwork/dashboard/types/account';
import { Goals, Roles } from '@thxnetwork/types/enums';
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

const roleLabelMap = {
    [Roles.None]: 'Select a role',
    [Roles.GrowthHacker]: 'Growth Hacker',
    [Roles.Marketer]: 'Marketer',
    [Roles.CommunityManager]: 'Community Manager',
    [Roles.Developer]: 'Developer',
    [Roles.Other]: 'Other',
};

const goalLabelMap = {
    [Goals.Reward]: 'Reward users in my game or app',
    [Goals.Retain]: 'Retain players or members',
    [Goals.Referral]: 'Set up referrals',
    [Goals.Social]: 'Integrate rewards in social channels',
    [Goals.Mint]: 'Mint tokens',
};

@Component({
    computed: mapGetters({
        account: 'account/profile',
    }),
})
export default class BaseModalRequestAccountEmailUpdate extends Vue {
    Roles = Roles;
    Goals = Goals;
    roleLabelMap = roleLabelMap;
    goalLabelMap = goalLabelMap;
    role = 'none';
    goal = [];
    isLoadingSubmit = false;

    account!: IAccount;

    get isSubmitDisabled() {
        return this.role === Roles.None || !this.goal.length;
    }

    async onClickSubmit() {
        if (this.isSubmitDisabled || this.isLoadingSubmit) return;
        debugger;
        this.isLoadingSubmit = true;
        await this.$store.dispatch('account/update', { role: this.role, goal: this.goal });
        this.isLoadingSubmit = false;
    }
}
</script>
