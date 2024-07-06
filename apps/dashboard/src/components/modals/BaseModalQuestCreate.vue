<template>
    <BaseModal
        @show="$emit('show')"
        size="xl"
        :title="(quest ? 'Update ' : 'Create ') + variant"
        :id="id"
        :error="error"
    >
        <template #modal-body>
            <form v-on:submit.prevent="$emit('submit')" id="formQuestCreate">
                <b-row>
                    <b-col md="6">
                        <BaseFormGroup
                            label="Status"
                            description="Publishing a quest will send a notification your campaign subscribers."
                            tooltip="Show your quest to your users."
                        >
                            <b-checkbox :checked="published" @change="$emit('change-published', $event)" class="mb-0">
                                Published
                            </b-checkbox>
                        </BaseFormGroup>
                        <BaseFormGroup
                            required
                            label="Title"
                            tooltip="A short and engaging title for your quest. Used when notifying subscribers and shown in the quest overview of your campaign."
                        >
                            <b-form-input :value="quest ? quest.title : ''" @change="$emit('change-title', $event)" />
                        </BaseFormGroup>
                        <BaseFormGroup
                            label="Description"
                            tooltip="Little bit of information about the quest shown in the quest overview of your campaign."
                        >
                            <b-textarea
                                :value="quest ? quest.description : ''"
                                @change="$emit('change-description', $event)"
                            />
                        </BaseFormGroup>
                        <BaseFormGroup
                            label="Image"
                            tooltip="Images make your quest more attractive and increase their click rate. Shown in the quest overview of the campaign."
                        >
                            <b-input-group>
                                <template #prepend v-if="quest ? quest.image : false">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="quest.image" height="35" width="auto" />
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
                        <BaseCardQuestLocks
                            class="mb-3"
                            :pool="pool"
                            :locks="quest ? quest.locks : []"
                            @change-locks="onChangeLocks"
                        />
                        <BaseCardInfoLinks
                            class="mb-3"
                            :info-links="infoLinks"
                            @change-info-links="$emit('change-info-links', $event)"
                        >
                            <p class="text-muted">
                                Add info links to your cards to provide your users with more information about this
                                quest.
                            </p>
                        </BaseCardInfoLinks>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="disabled || loading"
                class="rounded-pill"
                type="submit"
                form="formQuestCreate"
                variant="primary"
                block
            >
                <b-spinner small v-if="loading" />
                <template v-else>
                    {{ (quest ? 'Update ' : 'Create ') + variant }}
                </template>
            </b-button>
        </template>
    </BaseModal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
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
    imageFile: File | null = null;
    image = '';
    expirationDate: Date | string = '';
    expirationTime = '00:00:00';

    @Prop() id!: string;
    @Prop() pool!: TPool;
    @Prop({ required: false }) quest!: TQuest;
    @Prop() variant!: string;
    @Prop() loading!: boolean;
    @Prop() disabled!: boolean;
    @Prop() published!: boolean;
    @Prop() infoLinks!: TInfoLink[];
    @Prop() error!: string;

    mounted() {
        if (this.quest && this.quest.expiryDate) {
            const date = new Date(this.quest.expiryDate);
            this.expirationDate = date;
            this.expirationTime = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
        }
    }

    get minDate() {
        const date = new Date();
        date.setDate(date.getDate() + 1);
        return date;
    }

    onInputFile(file: File) {
        this.image = '';
        this.$emit('change-file', file);
    }

    onChangeDate(date: Date) {
        this.expirationDate = date;
        this.change();
    }

    onChangeTime(time: string) {
        this.expirationTime = time;
        this.change();
    }

    onClickExpiryRemove() {
        this.expirationDate = '';
        this.expirationTime = '00:00:00';
        this.$emit('change-date', '');
    }

    change() {
        if (!this.expirationDate) return;
        const expiryDate = new Date(this.expirationDate);
        const parts = this.expirationTime.split(':');
        expiryDate.setHours(Number(parts[0]));
        expiryDate.setMinutes(Number(parts[1]));
        expiryDate.setSeconds(Number(parts[2]));
        this.$emit('change-date', expiryDate.toISOString());
    }

    onChangeLocks(locks: TQuestLock[]) {
        this.$emit('change-locks', locks);
    }
}
</script>
