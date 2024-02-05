<template>
    <b-form-group label="Video URL">
        <b-form-input
            :value="url"
            :class="{ 'is-valid': videoId.length }"
            :placeholder="baseUrl + 'ckoegYJ1FR4'"
            @input="onChange"
        />
        <b-alert show class="mt-2" variant="info" v-if="videoId">
            YouTube Video ID: <strong> {{ videoId }}</strong>
        </b-alert>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownYoutubeVideo extends Vue {
    videoId = '';
    baseUrl = 'https://www.youtube.com/watch?v=';

    @Prop() content!: string;

    mounted() {
        this.onChange(this.url);
    }

    get url() {
        return this.content ? this.baseUrl + this.content : '';
    }

    onChange(url: string) {
        if (url && url.toLowerCase().includes('shorts')) return;

        const result = /^https?:\/\/(www\.)?youtu\.be/.test(url)
            ? url.replace(/^https?:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, '$2')
            : url.replace(/.*\?v=([\w-]{11}).*/, '$1');

        if (result !== this.url) {
            this.videoId = result;
            this.$emit('selected', { content: result, contentMetadata: { videoId: this.videoId, videoURL: url } });
        } else {
            this.videoId = '';
        }
    }
}
</script>
