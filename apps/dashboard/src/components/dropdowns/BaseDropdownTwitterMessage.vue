<template>
    <b-form-group label="Tweet Contains">
        <b-form-textarea v-model="message" @change="onInput" :state="state" />
        <ul class="mt-3">
            <li>Part of the post text needs to match exactly</li>
            <li>Can not contain URL's</li>
            <li>Can not contain new lines and breaks</li>
            <li>Will only match the last post not older than 24 hours</li>
        </ul>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { mapGetters } from 'vuex';

@Component({
    computed: mapGetters({}),
})
export default class BaseDropdownTwitterMessage extends Vue {
    preview: { tweet: { text: string }; user: { username: string; name: string } } | null = null;
    message = '';
    state: boolean | null = null;

    @Prop({ required: false }) content!: string;

    mounted() {
        this.message = this.content ? this.content : this.message;
        if (this.message) this.onInput(this.message);
    }

    @Watch('url')
    async onInput(message: string) {
        this.$emit('selected', {
            content: message,
            contentMetadata: {
                //
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
