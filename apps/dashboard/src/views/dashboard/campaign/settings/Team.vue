<template>
    <div>
        <b-form-row>
            <b-col md="4">
                <strong>Collaborators</strong>
                <p class="text-muted">Invite people from your team to collaborate on this campaign.</p>
            </b-col>
            <b-col md="8">
                <b-alert variant="danger" show v-if="errorCollaborator">{{ errorCollaborator }} </b-alert>
                <b-form-group label="E-mail" :state="isValidCollaboratorEmail">
                    <b-input-group>
                        <b-form-input
                            :state="isValidCollaboratorEmail"
                            v-model="emailCollaborator"
                            type="email"
                            placeholder="john@doe.com"
                        />
                        <b-input-group-append>
                            <b-button
                                :disabled="!isValidCollaboratorEmail"
                                @click="onClickCollaboratorInvite"
                                variant="dark"
                            >
                                <b-spinner small v-if="isSubmittingCollaborator" />
                                <template v-else>Send Invite</template>
                            </b-button>
                        </b-input-group-append>
                    </b-input-group>
                </b-form-group>
                <b-list-group v-if="pool.owner">
                    <b-list-group-item class="d-flex justify-content-between align-items-center bg-light">
                        {{ pool.owner.email }} (Owner)
                    </b-list-group-item>
                    <BaseListItemCollaborator
                        @error="errorCollaborator = $event"
                        :pool="pool"
                        :collaborator="collaborator"
                        :key="key"
                        v-for="(collaborator, key) of pool.collaborators"
                    />
                </b-list-group>
            </b-col>
        </b-form-row>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';
import { validateEmail } from '@thxnetwork/dashboard/utils/email';
import BaseListItemCollaborator from '@thxnetwork/dashboard/components/list-items/BaseListItemCollaborator.vue';

@Component({
    components: {
        BaseListItemCollaborator,
    },
    computed: {
        ...mapGetters({
            brands: 'brands/all',
            pools: 'pools/all',
            profile: 'account/profile',
        }),
    },
})
export default class SettingsView extends Vue {
    loading = true;
    error = '';
    profile!: TAccount;
    pools!: IPools;
    errorCollaborator = '';
    emailCollaborator = '';
    isSubmittingCollaborator = false;

    get pool() {
        return this.pools[this.$route.params.id];
    }

    get isValidCollaboratorEmail() {
        if (!this.emailCollaborator) return null;
        return !!validateEmail(this.emailCollaborator);
    }

    async sendInvite(email: string) {
        this.isSubmittingCollaborator = true;
        try {
            await this.$store.dispatch('pools/inviteCollaborator', { pool: this.pool, email });
        } catch (error) {
            this.errorCollaborator = (error as any).response.data.error.message;
        } finally {
            this.isSubmittingCollaborator = false;
        }
    }

    onClickCollaboratorInvite() {
        if (!this.isValidCollaboratorEmail) return;
        this.sendInvite(this.emailCollaborator);
    }
}
</script>
