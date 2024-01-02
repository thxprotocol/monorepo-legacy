<template>
    <div>
        <BaseFormGroupTwitterFollowersMin :amount="minFollowersCount" @input="onInputFollowersMin" />
        <b-form-group label="Tweet URL">
            <b-input-group>
                <b-form-input
                    debounce="1000"
                    v-model="url"
                    @change="onChange"
                    :state="isValidTweetUrl"
                    placeholder="e.g. https://twitter.com/twitter/status/1603121182101970945"
                />
                <b-input-group-append>
                    <b-button @click="onClickPreview()" variant="dark"> Preview </b-button>
                </b-input-group-append>
            </b-input-group>

            <b-spinner v-if="isLoading" small variant="primary" />
            <b-card class="mt-3" v-if="isValidTweetUrl && preview">
                <template #header>
                    <b-link class="text-dark" target="_blank" :href="`https://twitter.com/${preview.username}`">
                        {{ preview.name }}
                    </b-link>
                </template>
                <div v-html="preview.text"></div>
            </b-card>
            <b-alert show class="mt-3 mb-0" variant="warning" v-if="error">
                <i class="fas fa-info-circle mr-1" />
                {{ error }}
            </b-alert>
        </b-form-group>
    </div>
</template>

<script lang="ts">
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';
import BaseFormGroupTwitterFollowersMin from '@thxnetwork/dashboard/components/form-group/BaseFormGroupTwitterFollowersMin.vue';

@Component({
    components: {
        BaseFormGroupTwitterFollowersMin,
    },
})
export default class BaseDropdownTwitterTweets extends Vue {
    url = '';
    preview: { url: string; text: string; username: string; name: string } | null = null;
    error = '';
    isLoading = false;
    tweetId = '';
    minFollowersCount = 0;

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;

    // https://twitter.com/twitter/status/1603121182101970945
    mounted() {
        this.tweetId = this.content;
        this.url = this.tweetId ? 'https://twitter.com/twitter/status/' + this.tweetId : '';
        if (this.url && this.isValidTweetUrl && !this.contentMetadata) {
            this.getTweet();
        } else if (this.url && this.isValidTweetUrl && this.contentMetadata) {
            const metadata = JSON.parse(this.contentMetadata);
            this.preview = metadata;
            this.minFollowersCount = metadata.minFollowersCount;
        }
    }

    get isValidTweetUrl() {
        if (!this.url) return null;
        return (this.url.includes('twitter.com') || this.url.includes('x.com')) && this.url.includes('status');
    }

    onInputFollowersMin(amount: number) {
        debugger;
        this.minFollowersCount = amount;
        this.submit();
    }

    onChange() {
        this.getTweet();
    }

    onClickPreview() {
        this.getTweet();
    }

    getTweetId() {
        if (!this.url) {
            this.preview = null;
            this.error = '';
            this.isLoading = false;
        }

        if (!this.isValidTweetUrl) return '';

        const url = new URL(this.url);
        const urlParts = url.pathname.split('/');
        const tweetId = urlParts[urlParts.length - 1];
        if (!tweetId) return '';

        return tweetId;
    }

    async getTweet() {
        this.tweetId = this.getTweetId();
        if (!this.tweetId) return;

        this.isLoading = true;
        this.error = '';

        try {
            const { data } = await axios({
                method: 'POST',
                url: '/account/twitter/tweet',
                data: { tweetId: this.tweetId },
            });

            // Display rate limit error info if available
            if (data.error) {
                this.error = data.error;
                this.preview = null;
            } else if (data) {
                this.preview = {
                    url: this.url,
                    username: data.user.username,
                    name: data.user.name,
                    text: data.tweet.text,
                };
                this.submit();
            }
        } catch (error) {
            console.error(error);
            this.error = 'We did not succeed to retrieve the requested Twitter data...';
            this.preview = null;
        } finally {
            this.isLoading = false;
        }
    }

    submit() {
        debugger;
        this.$emit('selected', {
            content: this.tweetId,
            contentMetadata: {
                ...this.preview,
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
