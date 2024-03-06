<template>
    <b-form-group label="Video URL">
        <b-form-input
            :value="videoURL"
            :class="{ 'is-valid': videoId }"
            :placeholder="baseUrl + 'ckoegYJ1FR4'"
            @input="onInput"
        />
        <b-alert show class="mt-2" variant="info" v-if="videoId">
            YouTube Video ID: <strong> {{ videoId }}</strong>
        </b-alert>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

const parseVideoId = (url: string) => {
    return /^https?:\/\/(www\.)?youtu\.be/.test(url)
        ? url.replace(/^https?:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, '$2')
        : url.replace(/.*\?v=([\w-]{11}).*/, '$1');
};

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownYoutubeVideo extends Vue {
    videoId = '';
    // videoURL = '';
    baseUrl = 'https://www.youtube.com/watch?v=';

    @Prop() content!: string;
    @Prop() contentMetadata!: { videoURL?: string };

    mounted() {
        this.videoId = this.content;
    }

    get videoURL() {
        if (!this.contentMetadata || !this.contentMetadata.videoURL) return this.baseUrl + this.videoId;
        return this.contentMetadata.videoURL;
    }

    onInput(url: string) {
        if (url && url.toLowerCase().includes('shorts')) return;

        const videoId = parseVideoId(url);
        if (!videoId) return;

        this.videoId = videoId;
        const videoURL = this.baseUrl + this.videoId;
        this.$emit('selected', { content: videoId, contentMetadata: { videoURL: this.videoURL } });
    }
}
</script>
