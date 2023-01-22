<template>
    <b-form-group label="YouTube Video URL">
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
    @Prop() item!: string;
    videoId = '';
    url = '';
    baseUrl = 'https://www.youtube.com/watch?v=';

    onChange(url: string) {
        const result = /^https?:\/\/(www\.)?youtu\.be/.test(url)
            ? url.replace(/^https?:\/\/(www\.)?youtu\.be\/([\w-]{11}).*/, '$2')
            : url.replace(/.*\?v=([\w-]{11}).*/, '$1');

        if (result !== this.url) {
            this.videoId = result;
            this.$emit('selected', { id: result });
            if (this.videoId.toLowerCase().includes('shorts')) {
                this.videoId = '';
                this.url = '';
            }
        } else {
            this.videoId = '';
        }
    }

    mounted() {
        if (this.item) {
            this.url = this.baseUrl + this.item;
            this.onChange(this.url);
        }
    }
}
</script>
