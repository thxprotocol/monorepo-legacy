<template>
    <b-list-group-item class="d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center">
            {{ collaborator.email }}
            <span class="ml-2">
                <b-spinner small v-if="isSubmitting" />
                <b-badge
                    v-else
                    v-b-tooltip
                    :title="`Last e-mail sent: ${format(new Date(collaborator.updatedAt), 'd-M yyyy (HH:mm)')}`"
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
                <b-dropdown-item-button @click="onClickCollaboratorInviteResend"> Resend </b-dropdown-item-button>
                <b-dropdown-item-button @click="onClickCollaboratorRemove"> Remove </b-dropdown-item-button>
            </b-dropdown>
        </div>
    </b-list-group-item>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TCollaborator, TPool } from '@thxnetwork/types/interfaces';
import { CollaboratorInviteState } from '@thxnetwork/types/enums';
import { format } from 'date-fns';

@Component({
    components: {},
})
export default class BaseCardReward extends Vue {
    format = format;
    CollaboratorInviteState = CollaboratorInviteState;
    isSubmitting = false;

    @Prop() pool!: TPool;
    @Prop() collaborator!: TCollaborator;

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
