<template>
    <b-form-group label="Channel ID" description="">
        <b-input-group prepend="#">
            <b-form-input @change="onChangeInput" :value="item" />
        </b-input-group>
    </b-form-group>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({})
export default class BaseDropdownYoutubeChannels extends Vue {
    url = '';

    @Prop() item!: string;

    mounted() {
        this.url = this.item;
    }

    onChangeInput(content: string) {
        this.url = content;
        this.$emit('selected', { content });
    }
}
</script>
