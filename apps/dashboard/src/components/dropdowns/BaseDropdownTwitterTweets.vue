<template>
    <b-form-group label="Tweet URL">
        <b-form-input
            @change="onChange"
            :value="url"
            :state="preview ? !!preview : null"
            placeholder="e.g. https://twitter.com/twitter/status/1603121182101970945"
        />
        <b-card class="mt-3" v-if="preview">
            <template #header>
                <b-link class="text-dark" target="_blank" :href="preview.author_url">
                    {{ preview.author_name }}
                </b-link>
            </template>
            <div v-html="preview.html"></div>
        </b-card>
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
    preview: { author_name: string; author_url: string; html: string } | null = null;
    url = '';

    @Prop({ required: false }) item!: string;

    mounted() {
        this.url = this.item ? 'https://twitter.com/twitter/status/' + this.item : '';
        if (this.url) this.onChange(this.url);
    }

    async onChange(url: string) {
        const urlParts = url.split('/');
        const id = urlParts[urlParts.length - 1];
        if (!id) {
            this.preview = null;
            return;
        }

        const { data } = await axios({
            method: 'POST',
            url: '/account/twitter/preview',
            data: { url },
        });

        this.preview = data;
        this.$emit('selected', id);
    }
}
</script>
<style>
.twitter-tweet {
    margin: 0;
}
</style>
