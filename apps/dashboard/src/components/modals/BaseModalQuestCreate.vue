<template>
    <BaseModal @show="$emit('show')" size="xl" :title="(quest ? 'Update ' : 'Create ') + label" :id="id" :error="error">
        <template #modal-body>
            <form v-on:submit.prevent="onSubmit" id="formQuestCreate">
                <b-row>
                    <b-col md="6">
                        <BaseFormGroup
                            label="Status"
                            description="Publishing a quest will send a notification your campaign subscribers."
                            tooltip="Show your quest to your users."
                        >
                            <b-checkbox v-model="isPublished" class="mb-0"> Published </b-checkbox>
                        </BaseFormGroup>
                        <BaseFormGroup
                            required
                            label="Title"
                            tooltip="A short and engaging title for your quest. Used when notifying subscribers and shown in the quest overview of your campaign."
                        >
                            <b-form-input v-model="title" />
                        </BaseFormGroup>
                        <BaseFormGroup
                            label="Description"
                            tooltip="Little bit of information about the quest shown in the quest overview of your campaign."
                        >
                            <b-textarea v-model="description" />
                        </BaseFormGroup>
                        <BaseFormGroup
                            label="Image"
                            tooltip="Images make your quest more attractive and increase their click rate. Shown in the quest overview of the campaign."
                        >
                            <b-input-group>
                                <template #prepend v-if="image">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="image" height="35" width="auto" />
                                    </div>
                                </template>
                                <b-form-file v-model="imageFile" accept="image/*" @input="onInputFile" />
                            </b-input-group>
                        </BaseFormGroup>
                        <BaseFormGroup
                            label="Expiry"
                            tooltip="This expiry date will be used to hide your quest automatically when the time comes. Easy way to keep your quest overview nice and clean."
                        >
                            <b-row>
                                <b-col md="6">
                                    <b-datepicker
                                        value-as-date
                                        :date-format-options="{
                                            year: 'numeric',
                                            month: 'short',
                                            day: '2-digit',
                                            weekday: 'short',
                                        }"
                                        :min="minDate"
                                        :value="expirationDate"
                                        @input="onChangeDate"
                                    />
                                </b-col>
                                <b-col md="6">
                                    <b-timepicker
                                        :disabled="!expirationDate"
                                        :value="expirationTime"
                                        @input="onChangeTime"
                                    />
                                </b-col>
                                <b-col>
                                    <b-link
                                        v-if="expirationDate"
                                        variant="link"
                                        class="text-danger small m-0"
                                        @click="onClickExpiryRemove"
                                    >
                                        Remove
                                    </b-link>
                                </b-col>
                            </b-row>
                        </BaseFormGroup>
                        <hr />
                        <slot name="col-left" />
                    </b-col>
                    <b-col md="6">
                        <slot name="col-right" />
                        <BaseCardQuestLocks class="mb-3" :pool="pool" :locks="locks" @change-locks="locks = $event" />
                        <BaseCardInfoLinks class="mb-3" :info-links="infoLinks" @change="onChangeInfoLinks">
                            <p class="text-muted">
                                Add info links to your cards to provide your users with more information about this
                                quest.
                            </p>
                        </BaseCardInfoLinks>
                        <BaseFormGroup description="This quest can only be completed once per day per IP address.">
                            <b-checkbox v-model="isIPLimitEnabled" class="mb-0">
                                Enable IP address cooldown
                            </b-checkbox>
                        </BaseFormGroup>
                        <BaseFormGroup
                            description="Quest entries require a manual review before points are transfered."
                        >
                            <b-checkbox v-model="isReviewEnabled" class="mb-0">
                                Enable manual entry reviews
                            </b-checkbox>
                        </BaseFormGroup>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="isSubmitDisabled"
                class="rounded-pill"
                type="submit"
                form="formQuestCreate"
                variant="primary"
                block
            >
                <b-spinner small v-if="isLoading" />
                <template v-else>
                    {{ (quest ? 'Update ' : 'Create ') + label }}
                </template>
            </b-button>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { isValidUrl } from '@thxnetwork/dashboard/utils/url';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseCardInfoLinks from '@thxnetwork/dashboard/components/cards/BaseCardInfoLinks.vue';
import BaseCardQuestLocks from '@thxnetwork/dashboard/components/cards/BaseCardQuestLocks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardInfoLinks,
        BaseCardQuestLocks,
    },
})
export default class ModalQuestCreate extends Vue {
    isPublished = false;
    isIPLimitEnabled = false;
    isReviewEnabled = false;
    title = '';
    description = '';
    infoLinks: TInfoLink[] = [{ label: '', url: '' }];
    file: File | null = null;
    locks: TQuestLock[] = [];
    imageFile: File | null = null;
    image = '';
    expiryDate: Date | string = '';

    expirationDate: Date | string = '';
    expirationTime = '00:00:00';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuest;
    @Prop() label!: string;
    @Prop() loading!: boolean;
    @Prop() disabled!: boolean;
    @Prop() error!: string;

    mounted() {
        this.isPublished = this.quest ? this.quest.isPublished : this.isPublished;
        this.title = this.quest ? this.quest.title : this.title;
        this.description = this.quest ? this.quest.description : this.description;
        this.image = this.quest ? this.quest.image : this.image;
        this.expiryDate = this.quest && this.quest.expiryDate ? this.quest.expiryDate : this.expiryDate;
        this.infoLinks = this.quest ? this.quest.infoLinks : this.infoLinks;
        this.locks = this.quest ? Object.values(this.quest.locks) : this.locks;
        this.isIPLimitEnabled = this.quest ? this.quest.isIPLimitEnabled : this.isIPLimitEnabled;
        this.isReviewEnabled = this.quest ? this.quest.isReviewEnabled : this.isReviewEnabled;
        if (this.quest && this.quest.expiryDate) {
            const date = new Date(this.quest.expiryDate);
            this.expirationDate = date;
            this.expirationTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        }
    }

    get isSubmitDisabled() {
        return this.disabled || !this.title || this.isLoading;
    }

    get isLoading() {
        return this.loading;
    }

    get minDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }

    onInputFile(file: File) {
        this.image = '';
        this.file = file;
    }

    onChangeDate(date: Date) {
        this.expirationDate = date;
        this.change();
    }

    onChangeTime(time: string) {
        this.expirationTime = time;
        this.change();
    }

    onChangeInfoLinks(infoLinks: TInfoLink[]) {
        this.infoLinks = [];
        this.infoLinks = infoLinks;
    }

    onClickExpiryRemove() {
        this.expirationDate = '';
        this.expirationTime = '00:00:00';
        this.expiryDate = '';
    }

    change() {
        if (!this.expirationDate) return;
        const expiryDate = new Date(this.expirationDate);
        const parts = this.expirationTime.split(':');
        expiryDate.setHours(Number(parts[0]));
        expiryDate.setMinutes(Number(parts[1]));
        expiryDate.setSeconds(Number(parts[2]));
        this.expiryDate = expiryDate.toISOString();
    }

    onSubmit() {
        this.$emit('submit', {
            _id: this.quest ? this.quest._id : undefined,
            poolId: this.pool._id,
            isPublished: this.isPublished,
            title: this.title,
            description: this.description,
            file: this.file,
            expiryDate: this.expiryDate,
            locks: JSON.stringify(this.locks),
            infoLinks: JSON.stringify(this.infoLinks.filter((link) => link.label && isValidUrl(link.url))),
            isIPLimitEnabled: this.isIPLimitEnabled,
            isReviewEnabled: this.isReviewEnabled,
        });
    }
}
</script>
