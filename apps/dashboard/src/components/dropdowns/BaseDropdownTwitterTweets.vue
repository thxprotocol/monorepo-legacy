<template>
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
                <b-link class="text-dark" target="_blank" :href="`https://twitter.com/${preview.user.username}`">
                    {{ preview.user.name }}
                </b-link>
            </template>
            <div v-html="preview.tweet.text"></div>
        </b-card>
        <b-alert show class="mt-3 mb-0" variant="warning" v-if="error">
            <i class="fas fa-info-circle mr-1" />
            {{ error }}
        </b-alert>
    </b-form-group>
</template>

<script lang="ts">
import axios from 'axios';
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownTwitterTweets extends Vue {
    url = '';
    preview: { tweet: { text: string }; user: { username: string; name: string } } | null = null;
    error = '';
    isLoading = false;

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;

    // https://twitter.com/twitter/status/1603121182101970945
    mounted() {
        this.url = this.content ? 'https://twitter.com/twitter/status/' + this.content : '';
        if (this.url && this.isValidTweetUrl) this.getTweet();
    }

    get isValidTweetUrl() {
        if (!this.url) return null;
        return (this.url.includes('twitter.com') || this.url.includes('x.com')) && this.url.includes('status');
    }

    onChange() {
        this.getTweet();
    }

    onClickPreview() {
        this.getTweet();
    }

    async getTweet() {
        if (!this.url) {
            this.preview = null;
            this.error = '';
            this.isLoading = false;
        }

        if (!this.isValidTweetUrl) return;

        const url = new URL(this.url);
        const urlParts = url.pathname.split('/');
        const tweetId = urlParts[urlParts.length - 1];
        if (!tweetId) return;

        this.isLoading = true;
        this.error = '';

        try {
            const { data } = await axios({
                method: 'POST',
                url: '/account/twitter/tweet',
                data: { tweetId },
            });

            // Display rate limit error info if available
            if (data.error) {
                this.error = data.error;
                this.preview = null;
            } else if (data) {
                this.preview = data;
                this.$emit('selected', {
                    content: tweetId,
                    contentMetadata: {
                        url,
                        username: data.user.username,
                        text: data.tweet.text,
                    },
                });
            }
        } catch (error) {
            console.error(error);
            this.error = 'We did not succeed to retrieve the requested Twitter data...';
            this.preview = null;
        } finally {
            this.isLoading = false;
        }
    }
}
</script>
<style>
.twitter-tweet {
    margin: 0;
}
</style>
