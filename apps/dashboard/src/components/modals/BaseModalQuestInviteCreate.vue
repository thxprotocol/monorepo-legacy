<template>
    <BaseModalQuestCreate
        variant="Invite Quest"
        @show="onShow"
        @submit="onSubmit"
        @change-info-links="infoLinks = Object.values($event)"
        @change-title="title = $event"
        @change-date="expiryDate = $event"
        @change-description="description = $event"
        @change-file="file = $event"
        @change-published="isPublished = $event"
        @change-locks="locks = $event"
        :pool="pool"
        :published="isPublished"
        :id="id"
        :error="error"
        :info-links="infoLinks"
        :loading="isLoading"
        :disabled="isDisabled || !amount || !title"
        :quest="reward"
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
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import { TQuestState } from '@thxnetwork/dashboard/store/modules/pools';
import BaseModal from './BaseModal.vue';
import BaseModalQuestCreate from '@thxnetwork/dashboard/components/modals/BaseModalQuestCreate.vue';

@Component({
    components: {
        BaseModal,
        BaseModalQuestCreate,
    },
    computed: mapGetters({
        questList: 'pools/quests',
    }),
})
export default class ModalQuestInviteCreate extends Vue {
    isLoading = false;
    error = '';
    title = '';
    description = '';
    amount = 0;
    amountInvitee = 0;
    isPublished = false;
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    file: File | null = null;
    expiryDate: Date | string = '';
    locks: TQuestLock[] = [];
    requiredQuest: TQuest | null = null;
    questList!: TQuestState;

    @Prop() id!: string;
    @Prop() total!: number;
    @Prop() pool!: TPool;
    @Prop({ required: false }) reward!: TQuestInvite;

    get quests() {
        if (!this.questList[this.pool._id]) return [];
        return this.questList[this.pool._id].results;
    }

    get isDisabled() {
        return this.isLoading;
    }

    onShow() {
        this.title = this.reward ? this.reward.title : '';
        this.isPublished = this.reward ? this.reward.isPublished : this.isPublished;
        this.description = this.reward ? this.reward.description : '';
        this.amount = this.reward ? this.reward.amount : this.amount;
        this.amountInvitee = this.reward ? this.reward.amountInvitee : this.amountInvitee;
        this.infoLinks = this.reward ? this.reward.infoLinks : this.infoLinks;
        this.expiryDate = this.reward && this.reward.expiryDate ? this.reward.expiryDate : this.expiryDate;
        this.locks = this.reward ? this.reward.locks : this.locks;
        if (this.reward && this.reward.requiredQuest) {
            this.requiredQuest = this.quests.find((quest) => quest._id === this.reward.requiredQuest.questId) as TQuest;
        }
    }

    onSubmit() {
        this.isLoading = true;
        this.$store
            .dispatch(`pools/${this.reward ? 'updateQuest' : 'createQuest'}`, {
                ...this.reward,
                poolId: String(this.pool._id),
                variant: QuestVariant.Invite,
                title: this.title,
                description: this.description,
                amount: this.amount,
                amountInvitee: this.amountInvitee,
                requiredQuest: this.requiredQuest && {
                    questId: this.requiredQuest._id,
                    variant: this.requiredQuest.variant,
                },
                isPublished: this.isPublished,
                expiryDate: this.expiryDate,
                infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
                locks: this.locks,
            })
            .then(() => {
                this.$bvModal.hide(this.id);
                this.$emit('submit', { isPublished: this.isPublished });
                this.isLoading = false;
            });
    }
}
</script>
