<template>
    <base-modal
        @show="$emit('show')"
        size="xl"
        :title="(quest ? 'Update ' : 'Create ') + variant"
        :id="id"
        :error="error"
        :loading="loading"
    >
        <template #modal-body v-if="!loading">
            <form v-on:submit.prevent="$emit('submit')" id="formQuestCreate">
                <b-row>
                    <b-col md="6">
                        <b-form-group label="Title">
                            <b-form-input :value="quest ? quest.title : ''" @change="$emit('change-title', $event)" />
                        </b-form-group>
                        <b-form-group label="Description">
                            <b-textarea
                                :value="quest ? quest.description : ''"
                                @change="$emit('change-description', $event)"
                            />
                        </b-form-group>
                        <b-form-group label="Image">
                            <b-input-group>
                                <template #prepend v-if="quest ? quest.image : false">
                                    <div class="mr-2 bg-light p-2 border-radius-1">
                                        <img :src="quest.image" height="35" width="auto" />
                                    </div>
                                </template>
                                <b-form-file v-model="imageFile" accept="image/*" @input="onInputFile" />
                            </b-input-group>
                        </b-form-group>
                        <slot name="col-left" />
                    </b-col>
                    <b-col md="6">
                        <slot name="col-right" />
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
                        <b-form-group>
                            <b-checkbox :checked="published" @change="$emit('change-published', $event)">
                                Published
                            </b-checkbox>
                        </b-form-group>
                    </b-col>
                </b-row>
            </form>
        </template>
        <template #btn-primary>
            <b-button
                :disabled="disabled"
                class="rounded-pill"
                type="submit"
                form="formQuestCreate"
                variant="primary"
                block
            >
                {{ (quest ? 'Update ' : 'Create ') + variant }}
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import type { TBaseReward, TInfoLink } from '@thxnetwork/types/interfaces';
import BaseModal from '@thxnetwork/dashboard/components/modals/BaseModal.vue';
import BaseCardURLWebhook from '@thxnetwork/dashboard/components/cards/BaseCardURLWebhook.vue';
import BaseCardRewardExpiry from '@thxnetwork/dashboard/components/cards/BaseCardRewardExpiry.vue';
import BaseCardInfoLinks from '@thxnetwork/dashboard/components/cards/BaseCardInfoLinks.vue';

@Component({
    components: {
        BaseModal,
        BaseCardRewardExpiry,
        BaseCardURLWebhook,
        BaseCardInfoLinks,
    },
})
export default class ModalQuestCreate extends Vue {
    imageFile: File | null = null;
    error = '';
    image = '';

    @Prop() id!: string;
    @Prop() variant!: string;
    @Prop() loading!: boolean;
    @Prop() disabled!: boolean;
    @Prop() published!: boolean;
    @Prop({ required: false }) quest!: TBaseReward;
    @Prop() infoLinks!: TInfoLink[];

    onInputFile(file: File) {
        this.image = '';
        this.$emit('change-file', file);
    }
}
</script>
