<template>
    <b-form-group label="Channel ID" description="">
        <b-input-group prepend="#">
            <b-form-input @change="onChangeInput" :value="content" />
        </b-input-group>
        <template #description>
            <b-link
                target="_blank"
                href="https://support.google.com/youtube/answer/3250431?hl=en#:~:text=Find%20your%20channel's%20user%20ID%20%26%20channel%20ID&text=Sign%20in%20to%20YouTube.&text=From%20the%20left%20menu%2C%20select,channel's%20user%20and%20channel%20IDs."
            >
                Learn how to find your YouTube Channel ID.
            </b-link>
        </template>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownYoutubeChannels extends Vue {
    channelId = '';

    @Prop() content!: string;

    mounted() {
        this.channelId = this.content;
    }

    onChangeInput(content: string) {
        this.channelId = content;
        this.$emit('selected', { content, contentMetadata: { channelId: this.channelId } });
    }
}
</script>
