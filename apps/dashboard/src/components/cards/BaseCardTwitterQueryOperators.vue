<template>
    <div>
        <b-card v-if="from" bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
            <BaseFormGroupInputMultiple
                label="From"
                tooltip="Match posts from any of these authors."
                prepend="@"
                :fields="from"
                @input="$emit('from', $event)"
            />
        </b-card>
        <b-card v-if="to" bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
            <BaseFormGroupInputMultiple
                label="To"
                tooltip="Match posts in reply to any of these authors."
                prepend="@"
                :fields="to"
                @input="$emit('to', $event)"
            />
        </b-card>
        <b-card v-if="text" bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
            <BaseFormGroupInputMultiple
                label="Text"
                tooltip="Match posts containing any of these specific texts."
                prepend=""
                :fields="text"
                @input="$emit('text', $event)"
            />
        </b-card>
        <b-card v-if="url" bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
            <BaseFormGroupInputMultiple
                label="URL's"
                tooltip="Match posts containing these URL's. Will match shortened URL's as well."
                prepend="https://"
                :fields="url"
                @input="$emit('url', $event)"
            />
        </b-card>
        <b-card v-if="hashtags" bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
            <BaseFormGroupInputMultiple
                label="Hashtags"
                tooltip="Match posts containing any of these hashtags."
                prepend="#"
                :fields="hashtags"
                @input="$emit('hashtags', $event)"
            />
        </b-card>
        <b-card v-if="mentions" bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
            <BaseFormGroupInputMultiple
                label="Mentions"
                tooltip="Match posts containing any of these mentions."
                prepend="@"
                :fields="mentions"
                @input="$emit('mentions', $event)"
            />
        </b-card>
        <b-card bg-variant="light" class="mb-2 w-100" body-class="pt-2 pb-1 px-3">
            <div class="d-flex align-items-start">
                <div class="d-flex align-items-start mr-2 flex-grow-0" style="min-width: 90px">
                    Media
                    <b-link
                        class="text-muted ml-auto"
                        v-b-tooltip
                        title="Match posts containing specific media types. Set to Ignore to match no or any type of media."
                    >
                        <i class="fas fa-info-circle" />
                    </b-link>
                </div>
                <b-form-select :value="media" @change="$emit('media', $event)" size="sm">
                    <b-form-select-option value="ignore">Ignore</b-form-select-option>
                    <b-form-select-option value="has:media">Any Media</b-form-select-option>
                    <b-form-select-option value="has:images">Images</b-form-select-option>
                    <b-form-select-option value="has:video_link">Video</b-form-select-option>
                </b-form-select>
            </div>
        </b-card>
        <b-form-group class="mt-3">
            <template #label>
                Exclude content types
                <b-link
                    class="text-muted ml-auto"
                    v-b-tooltip
                    title="Filter out specific types of content in order to optimize your results."
                >
                    <i class="fas fa-info-circle" />
                </b-link>
            </template>
            <b-form-checkbox-group
                id="checkbox-group-accepted-content"
                v-model="excludesModel"
                :options="excludeOptions"
            />
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseFormGroupInputMultiple from '@thxnetwork/dashboard/components/form-group/BaseFormGroupInputMultiple.vue';

export const excludeOptions = [
    { value: '-is:retweet', text: 'Retweet' },
    { value: '-is:quote', text: 'Quote' },
    { value: '-is:reply', text: 'Reply' },
];

@Component({
    components: { BaseFormGroupInputMultiple },
})
export default class BaseCardTwitterQueryOperators extends Vue {
    @Prop() from!: string[];
    @Prop() to!: string[];
    @Prop() text!: string[];
    @Prop() url!: string[];
    @Prop() hashtags!: string[];
    @Prop() mentions!: string[];
    @Prop() media!: string;
    @Prop() excludes!: string[];

    excludeOptions = excludeOptions;

    get excludesModel() {
        return this.excludes;
    }

    set excludesModel(value: string[]) {
        this.$emit('excludes', value);
    }
}
</script>
