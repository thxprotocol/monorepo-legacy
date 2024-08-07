<template>
    <BaseModalQuestCreate
        label="Invite Quest"
        @show="onShow"
        @submit="onSubmit"
        :id="id"
        :pool="pool"
        :quest="quest"
        :loading="isLoading"
        :disabled="isSubmitDisabled"
        :error="error"
    >
        <template #col-left>
            <BaseFormGroup
                required
                label="Amount"
                tooltip="The amount the inviter will earn once the invitee has completed the required quests."
            >
                <b-form-input v-model="amount" type="number" />
            </BaseFormGroup>
            <BaseFormGroup
                label="Amount (Invitee)"
                tooltip="The amount the invitee will earn when the required quests have been completed."
            >
                <b-form-input v-model="amountInvitee" type="number" />
            </BaseFormGroup>
            <BaseFormGroup
                label="Required Quest"
                tooltip="The invitee needs to complete this quest before points will be transferred."
            >
                <b-dropdown
                    variant="light"
                    toggle-class="form-control d-flex align-items-center justify-content-between"
                    menu-class="w-100"
                    class="w-100"
                >
                    <template #button-content>
                        <div v-if="requiredQuest">{{ requiredQuest.title }}</div>
                        <div v-else>Select a quest</div>
                    </template>
                    <b-dropdown-item-button @click="requiredQuest = quest" :key="key" v-for="(quest, key) of quests">
                        {{ quest.title }}
                    </b-dropdown-item-button>
                </b-dropdown>
            </BaseFormGroup>
        </template>

        <template #col-right> </template>
    </BaseModalQuestCreate>
</template>

<script lang="ts">
import { mapGetters } from 'vuex';
import { QuestVariant } from '@thxnetwork/common/enums';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TQuestState } from '@thxnetwork/dashboard/store/modules/pools';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

@Component({
    components: {
        BaseModalQuestCreate,
    },
    computed: mapGetters({
        questList: 'pools/quests',
    }),
})
export default class ModalQuestInviteCreate extends Vue {
    isLoading = false;
    error = '';
    amount = 0;
    amountInvitee = 0;
    requiredQuest: TQuest | null = null;

    questList!: TQuestState;

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuestInvite;

    get quests() {
        if (!this.questList[this.pool._id]) return [];
        return this.questList[this.pool._id].results;
    }

    get isSubmitDisabled() {
        return this.isLoading;
    }

    onShow() {
        this.amount = this.quest ? this.quest.amount : this.amount;
        this.amountInvitee = this.quest ? this.quest.amountInvitee : this.amountInvitee;
        this.requiredQuest =
            this.quest && this.quest.requiredQuest
                ? (this.quests.find((quest) => quest._id === this.quest.requiredQuest.questId) as TQuest)
                : this.requiredQuest;
    }

    async onSubmit(payload: TBaseQuest) {
        this.isLoading = true;
        try {
            await this.$store.dispatch(`pools/${this.quest ? 'updateQuest' : 'createQuest'}`, {
                ...this.quest,
                ...payload,
                variant: QuestVariant.Invite,
                amount: this.amount,
                amountInvitee: this.amountInvitee,
                requiredQuest: this.requiredQuest && {
                    questId: this.requiredQuest._id,
                    variant: this.requiredQuest.variant,
                },
            });
            this.$bvModal.hide(this.id);
            this.$emit('submit', { isPublished: payload.isPublished });
            this.isLoading = false;
        } catch (error: any) {
            this.error = error.message;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
