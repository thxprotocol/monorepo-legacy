<template>
    <div>
        <BaseFormGroup
            required
            label="Video URL"
            description="URL's for YouTube shorts are now allowed."
            tooltip="We validate if this video is part of the campaign participants latest 50 liked YouTube video's."
        >
            <b-form-input
                v-model="url"
                :class="{ 'is-valid': videoId }"
                :placeholder="baseUrl + 'ckoegYJ1FR4'"
                @input="onInput"
            />
        </BaseFormGroup>
        <b-alert show class="mt-2" variant="info" v-if="url && !videoId">
            <strong>Could not process your URL.</strong> Please use this format:
            <em>https://www.youtube.com/watch?v=ckoegYJ1</em>
        </b-alert>
        <b-alert show class="mt-2" variant="info" v-if="url && videoId">
            YouTube Video ID: <strong> {{ videoId }}</strong>
        </b-alert>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

const parseVideoId = (url: string) => {
    const videoId = /^https?:\/\/(www\.)?youtu\.be/.test(url)
        ? url.replace(/^https?:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, '$2')
        : url.replace(/.*\?v=([\w-]{11}).*/, '$1');
    if (videoId !== url) return videoId;
    return '';
};

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownYoutubeVideo extends Vue {
    baseUrl = 'https://www.youtube.com/watch?v=';
    url = '';

    @Prop() content!: string;
    @Prop() contentMetadata!: { videoURL?: string };

    mounted() {
        if (this.contentMetadata) {
            this.url = this.contentMetadata?.videoURL || '';
        }
    }

    get isValid() {
        return false;
    }

    get videoId() {
        try {
            return parseVideoId(this.url);
        } catch (error) {
            return '';
        }
    }

    onInput(url: string) {
        if (url && url.toLowerCase().includes('shorts')) {
            throw new Error('Shorts are not supported. Please provide a full video URL.');
        }
        this.$emit('selected', { content: this.videoId, contentMetadata: { videoURL: url } });
    }
}
</script>
