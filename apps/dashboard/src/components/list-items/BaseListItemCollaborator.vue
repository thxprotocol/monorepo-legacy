<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
            {{ collaborator.account ? collaborator.account.email : collaborator.email }}
            <span class="ml-2">
                <b-spinner small v-if="isSubmitting" />
                <b-badge
                    v-else
                    v-b-tooltip
                    :title="tooltipText[collaborator.state]"
                    variant="light"
                    class="p-2 font-weight-normal"
                >
                    {{ CollaboratorInviteState[collaborator.state] }}
                </b-badge>
            </span>
        </div>
        <div class="d-flex align-items-center">
            <b-dropdown variant="link" size="sm" no-caret right toggle-class="">
                <template #button-content>
                    <i class="fas fa-ellipsis-v ml-0" />
                </template>
                <b-dropdown-item-button
                    v-if="collaborator.state === CollaboratorInviteState.Pending"
                    @click="onClickCollaboratorInviteResend"
                >
                    Resend
                </b-dropdown-item-button>
                <b-dropdown-item-button @click="onClickCollaboratorRemove">
                    {{ profile && collaborator.sub === profile.sub ? 'Leave' : 'Remove' }}
                </b-dropdown-item-button>
            </b-dropdown>
        </div>
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TAccount, TCollaborator, TPool } from '@thxnetwork/types/interfaces';
import { CollaboratorInviteState } from '@thxnetwork/common/enums';
import { format } from 'date-fns';
import { mapGetters } from 'vuex';

@Component({
    components: {},
    computed: {
        ...mapGetters({
            profile: 'account/profile',
        }),
    },
})
export default class BaseCardReward extends Vue {
    format = format;
    CollaboratorInviteState = CollaboratorInviteState;
    isSubmitting = false;
    profile!: TAccount;

    @Prop() pool!: TPool;
    @Prop() collaborator!: TCollaborator;

    get tooltipText() {
        const { email, updatedAt } = this.collaborator;
        const lastUpdate = format(new Date(updatedAt), 'd-M yyyy (HH:mm)');
        return {
            [CollaboratorInviteState.Pending]: `Invite for ${email} last sent on: ${lastUpdate}`,
            [CollaboratorInviteState.Accepted]: `Invite for ${email} accepted on: ${lastUpdate}`,
        };
    }

    async onClickCollaboratorInviteResend() {
        this.$emit('error', '');
        this.isSubmitting = true;
        try {
            await this.$store.dispatch('pools/inviteCollaborator', { pool: this.pool, email: this.collaborator.email });
        } catch (error) {
            this.$emit('error', (error as any).response.data.error.message);
        } finally {
            this.isSubmitting = false;
        }
    }

    async onClickCollaboratorRemove() {
        this.isSubmitting = true;
        try {
            await this.$store.dispatch('pools/removeCollaborator', { pool: this.pool, uuid: this.collaborator.uuid });
        } catch (error) {
            this.$emit('error', (error as any).response.data.error.message);
        } finally {
            this.isSubmitting = false;
        }
    }
}
</script>
