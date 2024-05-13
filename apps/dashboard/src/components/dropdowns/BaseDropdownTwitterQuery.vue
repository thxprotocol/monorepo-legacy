<template>
    <div>
        <b-form-group label="Query">
            <code>{{ query }}</code>
        </b-form-group>
        <BaseCardTwitterQueryOperators
            class="mb-3"
            :from="from"
            @from="set('from', $event)"
            :to="to"
            @to="set('to', $event)"
            :text="text"
            @text="set('text', $event)"
            :url="url"
            @url="set('url', $event)"
            :hashtags="hashtags"
            @hashtags="set('hashtags', $event)"
            :mentions="mentions"
            @mentions="set('mentions', $event)"
            :media="media"
            @media="set('media', $event)"
            :excludes="excludes"
            @excludes="set('excludes', $event)"
        />
        <BaseFormGroupTwitterFollowersMin :amount="minFollowersCount" @input="onInputFollowersMin" />
    </div>
</template>

<script lang="ts">
import { TwitterQuery } from '@thxnetwork/common/twitter';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import BaseCardTwitterQueryOperators, {
    excludeOptions,
} from '@thxnetwork/dashboard/components/cards/BaseCardTwitterQueryOperators.vue';
import BaseFormGroupTwitterFollowersMin from '@thxnetwork/dashboard/components/form-group/BaseFormGroupTwitterFollowersMin.vue';

@Component({
    components: { BaseFormGroupTwitterFollowersMin, BaseCardTwitterQueryOperators },
})
export default class BaseDropdownTwitterQuery extends Vue {
    preview: { tweet: { text: string }; user: { username: string; name: string } } | null = null;
    state: boolean | null = null;
    minFollowersCount = 0;

    // Operators
    from = [];
    to = [];
    text = [];
    url = [];
    hashtags = [];
    mentions = [];
    media = '';
    excludes: string[] = [excludeOptions[0].value, excludeOptions[1].value, excludeOptions[2].value];

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;

    set(key: string, value: string[]) {
        this[key] = []; // Clear array to force reactivity since we replace the full aray instead of one of its values
        this[key] = value;
    }

    mounted() {
        if (this.contentMetadata) {
            const { minFollowersCount, operators } = this.contentMetadata;
            this.minFollowersCount = minFollowersCount;

            // Parse stringified operators
            for (const key in operators) {
                this[key] = operators[key];
            }
        }

        // // Create query from operators
        // const query = TwitterQuery.create(this.operators);
    }

    onInputFollowersMin(amount: number) {
        this.minFollowersCount = amount;
        this.onInput(this.query);
    }

    get query() {
        return (
            TwitterQuery.create({
                from: this.from,
                to: this.to,
                text: this.text,
                url: this.url,
                hashtags: this.hashtags,
                mentions: this.mentions,
                media: this.media,
                excludes: this.excludes,
            }) || ''
        );
    }

    @Watch('query')
    async onInput(query: string) {
        this.$emit('selected', {
            content: query,
            contentMetadata: {
                query,
                operators: {
                    from: this.from,
                    to: this.to,
                    text: this.text,
                    url: this.url,
                    hashtags: this.hashtags,
                    mentions: this.mentions,
                    media: this.media,
                    excludes: this.excludes,
                },
                minFollowersCount: this.minFollowersCount,
            },
        });
    }
}
</script>
<style>
.twitter-tweet {
    margin: 0;
}
</style>
