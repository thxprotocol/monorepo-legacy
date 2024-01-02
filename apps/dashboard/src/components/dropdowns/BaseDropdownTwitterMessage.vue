<template>
    <div>
        <BaseFormGroupTwitterFollowersMin :amount="minFollowersCount" @input="onInputFollowersMin" />
        <b-form-group label="Tweet Contains">
            <b-form-textarea v-model="message" @change="onInput" :state="state" />
            <ul class="mt-3">
                <li>Part of the post text needs to match exactly</li>
                <li>Can not contain URL's</li>
                <li>Can not contain new lines and breaks</li>
                <li>Will only match the last post not older than 24 hours</li>
            </ul>
        </b-form-group>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import BaseFormGroupTwitterFollowersMin from '@thxnetwork/dashboard/components/form-group/BaseFormGroupTwitterFollowersMin.vue';

@Component({
    components: {
        BaseFormGroupTwitterFollowersMin,
    },
})
export default class BaseDropdownTwitterMessage extends Vue {
    preview: { tweet: { text: string }; user: { username: string; name: string } } | null = null;
    message = '';
    state: boolean | null = null;
    minFollowersCount = 0;

    @Prop({ required: false }) content!: string;
    @Prop({ required: false }) contentMetadata!: any;

    mounted() {
        this.message = this.content ? this.content : this.message;
        if (this.message) this.onInput(this.message);
        if (this.contentMetadata) {
            const { minFollowersCount } = JSON.parse(this.contentMetadata);
            this.minFollowersCount = minFollowersCount;
        }
    }

    onInputFollowersMin(amount: number) {
        this.minFollowersCount = amount;
        this.onInput(this.message);
    }

    @Watch('url')
    async onInput(message: string) {
        this.$emit('selected', {
            content: message,
            contentMetadata: {
                minFollowersCount: this.minFollowersCount,
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
