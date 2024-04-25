<template>
    <base-modal size="xl" hide-footer title="Twitter Query" :id="id" @show="onShow" :error="error">
        <template #modal-body>
            <b-row>
                <b-col>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <BaseFormGroupInputMultiple
                            label="From"
                            tooltip="Match posts from any of these authors."
                            prepend="@"
                            :fields="from"
                            @input="from = $event"
                        />
                    </b-card>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <BaseFormGroupInputMultiple
                            label="To"
                            tooltip="Match posts in reply to any of these authors."
                            prepend="@"
                            :fields="to"
                            @input="to = $event"
                        />
                    </b-card>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <BaseFormGroupInputMultiple
                            label="Text"
                            tooltip="Match posts containing any of these specific texts."
                            prepend=""
                            :fields="text"
                            @input="text = $event"
                        />
                    </b-card>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <BaseFormGroupInputMultiple
                            label="URL's"
                            tooltip="Match posts containing these URL's. Will match shortened URL's as well."
                            prepend="https://"
                            :fields="url"
                            @input="url = $event"
                        />
                    </b-card>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <BaseFormGroupInputMultiple
                            label="Hashtags"
                            tooltip="Match posts containing any of these hashtags."
                            prepend="#"
                            :fields="hashtags"
                            @input="hashtags = $event"
                        />
                    </b-card>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <BaseFormGroupInputMultiple
                            label="Cashtags"
                            tooltip="Match posts containing any of these cashtags."
                            prepend="$"
                            :fields="cashtags"
                            @input="cashtags = $event"
                        />
                    </b-card>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <BaseFormGroupInputMultiple
                            label="Mentions"
                            tooltip="Match posts containing any of these mentions."
                            prepend="@"
                            :fields="mentions"
                            @input="mentions = $event"
                        />
                    </b-card>
                    <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
                        <div class="d-flex align-items-start">
                            <div class="d-flex align-items-start mr-2 flex-grow-0" style="min-width: 90px">
                                Media
                                <b-link
                                    class="text-muted"
                                    v-b-tooltip
                                    title="Match posts containing specific media types. Set to Ignore to match no or any type of media."
                                >
                                    <sup>
                                        <i class="fas fa-info-circle" />
                                    </sup>
                                </b-link>
                            </div>
                            <b-form-select v-model="media" size="sm">
                                <b-form-select-option value="ignore">Ignore</b-form-select-option>
                                <b-form-select-option value="has:media">Any Media</b-form-select-option>
                                <b-form-select-option value="has:images">Images</b-form-select-option>
                                <b-form-select-option value="has:video_link">Video</b-form-select-option>
                            </b-form-select>
                        </div>
                    </b-card>
                </b-col>
                <b-col>
                    <BaseCardTwitterPostPreviews :operators="operators" />
                </b-col>
            </b-row>
            <b-button
                :disabled="isLoading"
                class="rounded-pill"
                type="submit"
                @click="onClickCreate"
                variant="primary"
                block
            >
                Create Rule
            </b-button>
        </template>
    </base-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { TwitterQuery } from '@thxnetwork/common/twitter';
import BaseModal from './BaseModal.vue';
import BaseFormGroupInputMultiple from '@thxnetwork/dashboard/components/form-group/BaseFormGroupInputMultiple.vue';
import BaseCardTwitterPostPreviews from '@thxnetwork/dashboard/components/cards/BaseCardTwitterPostPreviews.vue';

@Component({
    components: {
        BaseModal,
        BaseFormGroupInputMultiple,
        BaseCardTwitterPostPreviews,
    },
})
export default class BaseModalTwitterQueryCreate extends Vue {
    isLoading = false;
    isCopied = false;
    error = '';
    from = [''];
    to = [''];
    text = [''];
    url = [''];
    hashtags = [''];
    cashtags = [''];
    mentions = [''];
    media: string | null = null;

    @Prop() id!: string;
    @Prop() query!: TTwitterQuery;
    @Prop() pool!: TPool;

    onShow() {
        if (!this.query) return;

        this.from = this.query.operators.from ? this.query.operators.from : this.from;
        this.to = this.query.operators.to ? this.query.operators.to : this.to;
        this.text = this.query.operators.text ? this.query.operators.text : this.text;
        this.url = this.query.operators.url ? this.query.operators.url : this.url;
        this.hashtags = this.query.operators.hashtags ? this.query.operators.hashtags : this.hashtags;
        this.cashtags = this.query.operators.cashtags ? this.query.operators.cashtags : this.cashtags;
        this.mentions = this.query.operators.mentions ? this.query.operators.mentions : this.mentions;
        this.media = this.query.operators.media ? this.query.operators.media : this.media;
    }

    get operators() {
        return {
            from: this.from,
            to: this.to,
            text: this.text,
            url: this.url,
            hashtags: this.hashtags,
            cashtags: this.cashtags,
            mentions: this.mentions,
            media: this.media,
        };
    }

    async onClickCreate() {
        this.isLoading = true;
        try {
            const operators = TwitterQuery.stringify(this.operators);
            await this.$store.dispatch('pools/createTwitterQuery', {
                pool: this.pool,
                data: { operators },
            });
            this.$store.dispatch('pools/listTwitterQueries', { pool: this.pool });
        } catch (error) {
            throw error;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
@thxnetwork/common/twitterQuery
