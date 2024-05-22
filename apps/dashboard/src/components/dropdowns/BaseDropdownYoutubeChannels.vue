<template>
    <b-form-group label="Channel ID" description="">
        <b-input-group prepend="#">
            <b-form-input @change="onChangeInput" :value="content" />
        </b-input-group>
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
