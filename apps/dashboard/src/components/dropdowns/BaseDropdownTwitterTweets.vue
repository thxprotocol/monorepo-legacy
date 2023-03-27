<template>
    <b-form-group label="Tweet URL">
        <b-form-input
            debounce="1000"
            v-model="url"
            @change="onInput"
            :state="state"
            placeholder="e.g. https://twitter.com/twitter/status/1603121182101970945"
        />
        <b-card class="mt-3" v-if="preview">
            <template #header>
                <b-link class="text-dark" target="_blank" :href="`https://twitter.com/${preview.user.username}`">
                    {{ preview.user.name }}
                </b-link>
            </template>
            <div v-html="preview.tweet.text"></div>
        </b-card>
    </b-form-group>
</template>

<script lang="ts">
import axios from 'axios';
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownTwitterTweets extends Vue {
    preview: { tweet: { text: string }; user: { username: string; name: string } } | null = null;
    url = '';
    state: boolean | null = null;

    @Prop({ required: false }) content!: string;

    // https://twitter.com/twitter/status/1603121182101970945
    mounted() {
        this.url = this.content ? 'https://twitter.com/twitter/status/' + this.content : '';
        if (this.url) this.onInput(this.url);
    }

    @Watch('url')
    async onInput(url: string) {
        const urlParts = url.split('/');
        const tweetId = urlParts[urlParts.length - 1];
        const isValid = url.includes('twitter.com') && url.includes('status');

        if (!isValid || !tweetId) {
            this.preview = null;
            this.state = false;
            return;
        }

        const { data } = await axios({
            method: 'POST',
            url: '/account/twitter/tweet',
            data: { tweetId },
        });

        if (!data) {
            this.preview = null;
            this.state = false;
        } else {
            this.state = true;
            this.preview = data;
            this.$emit('selected', {
                content: tweetId,
                contentMetadata: {
                    url: this.url,
                    username: data.user.username,
                    text: data.tweet.text,
                },
            });
        }
    }
}
</script>
<style>
.twitter-tweet {
    margin: 0;
}
</style>
